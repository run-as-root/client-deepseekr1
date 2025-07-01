const fs = require('fs').promises;
const path = require('path');

class ConfigHelper {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.envExamplePath = path.join(process.cwd(), '.env.example');
  }

  /**
   * Detect current API format from environment
   * @returns {string} - 'openai' or 'deepseek'
   */
  detectApiFormat() {
    // Check explicit format setting
    if (process.env.API_FORMAT) {
      return process.env.API_FORMAT.toLowerCase();
    }

    // Auto-detect based on available variables
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_BASE_URL) {
      return 'openai';
    }

    if (process.env.DEEPSEEK_TOKEN && process.env.DEEPSEEK_BASE_URL) {
      return 'deepseek';
    }

    // Check base URL patterns
    const baseUrl = process.env.DEEPSEEK_BASE_URL || process.env.OPENAI_BASE_URL;
    if (baseUrl && (baseUrl.includes('openai.com') || baseUrl.includes('api.openai'))) {
      return 'openai';
    }

    // Default to deepseek for backward compatibility
    return 'deepseek';
  }

  /**
   * Get configuration for current API format
   * @returns {object} - Configuration object
   */
  getCurrentConfig() {
    const apiFormat = this.detectApiFormat();

    if (apiFormat === 'openai') {
      return {
        apiFormat: 'openai',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com',
        token: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        timeout: parseInt(process.env.DEEPSEEK_TIMEOUT || '30000')
      };
    } else {
      return {
        apiFormat: 'deepseek',
        baseUrl: process.env.DEEPSEEK_BASE_URL,
        token: process.env.DEEPSEEK_TOKEN,
        model: process.env.DEEPSEEK_MODEL || 'deepseek-r1:8b',
        timeout: parseInt(process.env.DEEPSEEK_TIMEOUT || '30000')
      };
    }
  }

  /**
   * Validate current configuration
   * @returns {object} - Validation result
   */
  validateConfig() {
    const config = this.getCurrentConfig();
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!config.baseUrl) {
      const urlVar = config.apiFormat === 'openai' ? 'OPENAI_BASE_URL' : 'DEEPSEEK_BASE_URL';
      errors.push(`Missing base URL. Set ${urlVar} environment variable.`);
    }

    if (!config.token) {
      const tokenVar = config.apiFormat === 'openai' ? 'OPENAI_API_KEY' : 'DEEPSEEK_TOKEN';
      errors.push(`Missing API token. Set ${tokenVar} environment variable.`);
    }

    // Check model compatibility
    if (config.apiFormat === 'openai' && config.model.includes('deepseek')) {
      warnings.push(`Using DeepSeek model "${config.model}" with OpenAI format. This may not work.`);
    }

    if (config.apiFormat === 'deepseek' && config.model.startsWith('gpt-')) {
      warnings.push(`Using OpenAI model "${config.model}" with DeepSeek format. This may not work.`);
    }

    // Check URL format
    if (config.baseUrl) {
      try {
        new URL(config.baseUrl);
      } catch (e) {
        errors.push(`Invalid base URL format: ${config.baseUrl}`);
      }
    }

    return {
      valid: errors.length === 0,
      config,
      errors,
      warnings
    };
  }

  /**
   * Generate configuration suggestions
   * @returns {object} - Configuration suggestions
   */
  generateConfigSuggestions() {
    const current = this.getCurrentConfig();

    const deepseekConfig = {
      name: 'DeepSeek (Self-hosted)',
      description: 'Use your own DeepSeek server on DigitalOcean',
      required: [
        'DEEPSEEK_BASE_URL=http://your-droplet-ip',
        'DEEPSEEK_TOKEN=your-token-here'
      ],
      optional: [
        'API_FORMAT=deepseek',
        'DEEPSEEK_MODEL=deepseek-r1:8b',
        'DEEPSEEK_TIMEOUT=30000'
      ]
    };

    const openaiConfig = {
      name: 'OpenAI API',
      description: 'Use official OpenAI API service',
      required: [
        'API_FORMAT=openai',
        'OPENAI_BASE_URL=https://api.openai.com',
        'OPENAI_API_KEY=your-openai-key-here'
      ],
      optional: [
        'OPENAI_MODEL=gpt-4',
        'DEEPSEEK_TIMEOUT=30000'
      ]
    };

    const customOpenaiConfig = {
      name: 'Custom OpenAI-Compatible',
      description: 'Use custom server with OpenAI-compatible API',
      required: [
        'API_FORMAT=openai',
        'OPENAI_BASE_URL=http://your-custom-server',
        'OPENAI_API_KEY=your-custom-key'
      ],
      optional: [
        'OPENAI_MODEL=your-model-name',
        'DEEPSEEK_TIMEOUT=30000'
      ]
    };

    return {
      current: current.apiFormat,
      configurations: [deepseekConfig, openaiConfig, customOpenaiConfig]
    };
  }

  /**
   * Read current .env file
   * @returns {Promise<string>} - .env file content
   */
  async readEnvFile() {
    try {
      return await fs.readFile(this.envPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return '';
      }
      throw error;
    }
  }

  /**
   * Write .env file
   * @param {string} content - Content to write
   * @returns {Promise<void>}
   */
  async writeEnvFile(content) {
    await fs.writeFile(this.envPath, content);
  }

  /**
   * Switch to specific API format
   * @param {string} format - 'openai' or 'deepseek'
   * @param {object} config - Configuration values
   * @returns {Promise<void>}
   */
  async switchApiFormat(format, config = {}) {
    if (!['openai', 'deepseek'].includes(format)) {
      throw new Error('Format must be either "openai" or "deepseek"');
    }

    const envContent = await this.readEnvFile();
    const lines = envContent.split('\n');
    const newLines = [];
    const processedKeys = new Set();

    // Helper function to add or update line
    const addOrUpdateLine = (key, value, comment = '') => {
      if (processedKeys.has(key)) return;
      processedKeys.add(key);

      if (comment) {
        newLines.push(`# ${comment}`);
      }
      newLines.push(`${key}=${value}`);
    };

    // Process existing lines, commenting out incompatible ones
    for (let line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('#') || trimmed === '') {
        newLines.push(line);
        continue;
      }

      const [key] = trimmed.split('=');

      if (format === 'openai') {
        if (key.startsWith('DEEPSEEK_') && !key.includes('TIMEOUT')) {
          newLines.push(`# ${line}`); // Comment out DeepSeek configs
        } else {
          newLines.push(line);
        }
      } else {
        if (key.startsWith('OPENAI_')) {
          newLines.push(`# ${line}`); // Comment out OpenAI configs
        } else {
          newLines.push(line);
        }
      }

      processedKeys.add(key);
    }

    // Add format specification
    if (!processedKeys.has('API_FORMAT')) {
      newLines.push('');
      addOrUpdateLine('API_FORMAT', format, `Using ${format.toUpperCase()} API format`);
    }

    // Add required configuration based on format
    if (format === 'openai') {
      newLines.push('');
      newLines.push('# OpenAI Configuration');

      if (!processedKeys.has('OPENAI_BASE_URL')) {
        addOrUpdateLine('OPENAI_BASE_URL', config.baseUrl || 'https://api.openai.com');
      }
      if (!processedKeys.has('OPENAI_API_KEY')) {
        addOrUpdateLine('OPENAI_API_KEY', config.token || 'your-openai-key-here');
      }
      if (!processedKeys.has('OPENAI_MODEL')) {
        addOrUpdateLine('OPENAI_MODEL', config.model || 'gpt-4');
      }
    } else {
      newLines.push('');
      newLines.push('# DeepSeek Configuration');

      if (!processedKeys.has('DEEPSEEK_BASE_URL')) {
        addOrUpdateLine('DEEPSEEK_BASE_URL', config.baseUrl || 'http://your-droplet-ip');
      }
      if (!processedKeys.has('DEEPSEEK_TOKEN')) {
        addOrUpdateLine('DEEPSEEK_TOKEN', config.token || 'your-token-here');
      }
      if (!processedKeys.has('DEEPSEEK_MODEL')) {
        addOrUpdateLine('DEEPSEEK_MODEL', config.model || 'deepseek-r1:8b');
      }
    }

    await this.writeEnvFile(newLines.join('\n'));
  }

  /**
   * Create configuration interactively
   * @param {function} prompt - Prompt function for user input
   * @returns {Promise<object>} - Created configuration
   */
  async createConfigInteractive(prompt) {
    const suggestions = this.generateConfigSuggestions();

    const { configType } = await prompt([
      {
        type: 'list',
        name: 'configType',
        message: 'Choose your AI service configuration:',
        choices: suggestions.configurations.map((config, index) => ({
          name: `${config.name} - ${config.description}`,
          value: index
        }))
      }
    ]);

    const selectedConfig = suggestions.configurations[configType];
    const format = configType === 0 ? 'deepseek' : 'openai';

    console.log(`\n📝 Configuring ${selectedConfig.name}...`);

    const config = {};

    if (format === 'deepseek') {
      const answers = await prompt([
        {
          type: 'input',
          name: 'baseUrl',
          message: 'DeepSeek server URL:',
          default: 'http://your-droplet-ip',
          validate: (input) => input.trim() !== '' || 'URL is required'
        },
        {
          type: 'input',
          name: 'token',
          message: 'DeepSeek authorization token:',
          validate: (input) => input.trim() !== '' || 'Token is required'
        },
        {
          type: 'input',
          name: 'model',
          message: 'Model name:',
          default: 'deepseek-r1:8b'
        }
      ]);

      Object.assign(config, answers);
    } else {
      const answers = await prompt([
        {
          type: 'input',
          name: 'baseUrl',
          message: 'OpenAI API base URL:',
          default: configType === 1 ? 'https://api.openai.com' : 'http://your-custom-server',
          validate: (input) => {
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        },
        {
          type: 'input',
          name: 'token',
          message: 'API key:',
          validate: (input) => input.trim() !== '' || 'API key is required'
        },
        {
          type: 'input',
          name: 'model',
          message: 'Model name:',
          default: configType === 1 ? 'gpt-4' : 'your-model-name'
        }
      ]);

      Object.assign(config, answers);
    }

    await this.switchApiFormat(format, config);

    return {
      format,
      config,
      validation: this.validateConfig()
    };
  }

  /**
   * Get example configurations for documentation
   * @returns {object} - Example configurations
   */
  getExampleConfigurations() {
    return {
      deepseek: {
        description: 'Self-hosted DeepSeek on DigitalOcean',
        env: `# DeepSeek Configuration
API_FORMAT=deepseek
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here
DEEPSEEK_MODEL=deepseek-r1:8b
DEEPSEEK_TIMEOUT=30000`,
        usage: `const client = new DeepSeekClient({
  apiFormat: 'deepseek',
  baseUrl: 'http://your-droplet-ip',
  token: 'your-token-here',
  model: 'deepseek-r1:8b'
});`
      },
      openai: {
        description: 'Official OpenAI API',
        env: `# OpenAI Configuration
API_FORMAT=openai
OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-4
DEEPSEEK_TIMEOUT=30000`,
        usage: `const client = new DeepSeekClient({
  apiFormat: 'openai',
  baseUrl: 'https://api.openai.com',
  token: 'your-openai-key-here',
  model: 'gpt-4'
});`
      },
      customOpenai: {
        description: 'Custom OpenAI-compatible API',
        env: `# Custom OpenAI-Compatible Configuration
API_FORMAT=openai
OPENAI_BASE_URL=http://your-custom-server
OPENAI_API_KEY=your-custom-key
OPENAI_MODEL=your-model-name
DEEPSEEK_TIMEOUT=30000`,
        usage: `const client = new DeepSeekClient({
  apiFormat: 'openai',
  baseUrl: 'http://your-custom-server',
  token: 'your-custom-key',
  model: 'your-model-name'
});`
      }
    };
  }
}

module.exports = ConfigHelper;
