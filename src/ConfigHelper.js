const fs = require("fs").promises;
const path = require("path");

class ConfigHelper {
  constructor() {
    this.envPath = path.join(process.cwd(), ".env");
    this.envExamplePath = path.join(process.cwd(), ".env.example");
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

    // Auto-detect based on BASE_URL patterns
    const baseUrl = process.env.BASE_URL;

    if (
      baseUrl &&
      (baseUrl.includes("openai.com") || baseUrl.includes("api.openai"))
    ) {
      return "openai";
    }

    // Default to deepseek for backward compatibility
    return "deepseek";
  }

  /**
   * Get configuration for current API format
   * @returns {object} - Configuration object
   */
  getCurrentConfig() {
    const apiFormat = this.detectApiFormat();

    // Platform-agnostic configuration
    const baseUrl =
      process.env.BASE_URL ||
      (apiFormat === "openai" ? "https://api.openai.com" : undefined);
    const token = process.env.API_KEY;
    const model =
      process.env.MODEL ||
      (apiFormat === "openai" ? "gpt-4" : "deepseek-r1:8b");
    const timeout = parseInt(process.env.TIMEOUT || "30000");

    const baseConfig = {
      apiFormat,
      baseUrl,
      token,
      model,
      timeout,
    };

    return baseConfig;
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
      errors.push(`Missing base URL. Set BASE_URL environment variable.`);
    }

    if (!config.token) {
      errors.push(`Missing API token. Set API_KEY environment variable.`);
    }

    // Check model compatibility
    if (config.apiFormat === "openai" && config.model.includes("deepseek")) {
      warnings.push(
        `Using DeepSeek model "${config.model}" with OpenAI format. This may not work.`,
      );
    }

    if (config.apiFormat === "deepseek" && config.model.startsWith("gpt-")) {
      warnings.push(
        `Using OpenAI model "${config.model}" with DeepSeek format. This may not work.`,
      );
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
      warnings,
    };
  }

  /**
   * Generate configuration suggestions
   * @returns {object} - Configuration suggestions
   */
  generateConfigSuggestions() {
    const current = this.getCurrentConfig();

    const deepseekConfig = {
      name: "DeepSeek (Self-hosted)",
      description: "Use your own DeepSeek server",
      required: [
        "API_FORMAT=deepseek",
        "BASE_URL=http://your-droplet-ip",
        "API_KEY=your-token-here",
      ],
      optional: ["MODEL=deepseek-r1:8b", "TIMEOUT=30000"],
    };

    const openaiConfig = {
      name: "OpenAI API",
      description: "Use official OpenAI API service",
      required: [
        "API_FORMAT=openai",
        "BASE_URL=https://api.openai.com",
        "API_KEY=your-openai-key-here",
      ],
      optional: ["MODEL=gpt-4", "TIMEOUT=30000"],
    };

    const customOpenaiConfig = {
      name: "Custom OpenAI-Compatible",
      description: "Use custom server with OpenAI-compatible API",
      required: [
        "API_FORMAT=openai",
        "BASE_URL=http://your-custom-server",
        "API_KEY=your-custom-key",
      ],
      optional: ["MODEL=your-model-name", "TIMEOUT=30000"],
    };

    return {
      current: current.apiFormat,
      configurations: [deepseekConfig, openaiConfig, customOpenaiConfig],
    };
  }

  /**
   * Read current .env file
   * @returns {Promise<string>} - .env file content
   */
  async readEnvFile() {
    try {
      return await fs.readFile(this.envPath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        return "";
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
    if (!["openai", "deepseek"].includes(format)) {
      throw new Error('Format must be either "openai" or "deepseek"');
    }

    const envContent = await this.readEnvFile();
    const lines = envContent.split("\n");
    const newLines = [];
    const processedKeys = new Set();

    // Helper function to add or update line
    const addOrUpdateLine = (key, value, comment = "") => {
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

      if (trimmed.startsWith("#") || trimmed === "") {
        newLines.push(line);
        continue;
      }

      const [key] = trimmed.split("=");

      // Keep only platform-agnostic variables
      if (
        ["API_FORMAT", "BASE_URL", "API_KEY", "MODEL", "TIMEOUT"].includes(key)
      ) {
        newLines.push(line);
      } else {
        // Comment out any legacy variables
        newLines.push(`# ${line}`);
      }

      processedKeys.add(key);
    }

    // Add format specification
    if (!processedKeys.has("API_FORMAT")) {
      newLines.push("");
      addOrUpdateLine(
        "API_FORMAT",
        format,
        `Using ${format.toUpperCase()} API format`,
      );
    }

    // Add platform-agnostic configuration
    newLines.push("");
    newLines.push("# Platform-Agnostic Configuration");

    if (!processedKeys.has("BASE_URL")) {
      const defaultUrl =
        format === "openai"
          ? "https://api.openai.com"
          : "http://your-server-url";
      addOrUpdateLine("BASE_URL", config.baseUrl || defaultUrl);
    }
    if (!processedKeys.has("API_KEY")) {
      addOrUpdateLine("API_KEY", config.token || "your-api-key-here");
    }
    if (!processedKeys.has("MODEL")) {
      const defaultModel = format === "openai" ? "gpt-4" : "deepseek-r1:8b";
      addOrUpdateLine("MODEL", config.model || defaultModel);
    }
    if (!processedKeys.has("TIMEOUT")) {
      addOrUpdateLine("TIMEOUT", "30000");
    }

    await this.writeEnvFile(newLines.join("\n"));
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
        type: "list",
        name: "configType",
        message: "Choose your AI service configuration:",
        choices: suggestions.configurations.map((config, index) => ({
          name: `${config.name} - ${config.description}`,
          value: index,
        })),
      },
    ]);

    const selectedConfig = suggestions.configurations[configType];
    const format = configType === 0 ? "deepseek" : "openai";

    console.log(`\n📝 Configuring ${selectedConfig.name}...`);

    const config = {};

    if (format === "deepseek") {
      const answers = await prompt([
        {
          type: "input",
          name: "baseUrl",
          message: "Server URL:",
          default: "http://your-server-url",
          validate: (input) => input.trim() !== "" || "URL is required",
        },
        {
          type: "input",
          name: "token",
          message: "API key/token:",
          validate: (input) => input.trim() !== "" || "API key is required",
        },
        {
          type: "input",
          name: "model",
          message: "Model name:",
          default: "deepseek-r1:8b",
        },
      ]);

      Object.assign(config, answers);
    } else {
      const answers = await prompt([
        {
          type: "input",
          name: "baseUrl",
          message: "API base URL:",
          default:
            configType === 1
              ? "https://api.openai.com"
              : "http://your-custom-server",
          validate: (input) => {
            try {
              new URL(input);
              return true;
            } catch {
              return "Please enter a valid URL";
            }
          },
        },
        {
          type: "input",
          name: "token",
          message: "API key:",
          validate: (input) => input.trim() !== "" || "API key is required",
        },
        {
          type: "input",
          name: "model",
          message: "Model name:",
          default: configType === 1 ? "gpt-4" : "your-model-name",
        },
      ]);

      Object.assign(config, answers);
    }

    await this.switchApiFormat(format, config);

    return {
      format,
      config,
      validation: this.validateConfig(),
    };
  }

  /**
   * Get example configurations for documentation
   * @returns {object} - Example configurations
   */
  getExampleConfigurations() {
    return {
      deepseek: {
        description: "Self-hosted DeepSeek server",
        env: `# DeepSeek Configuration
API_FORMAT=deepseek
BASE_URL=http://your-server-url
API_KEY=your-api-key-here
MODEL=deepseek-r1:8b
TIMEOUT=30000`,
        usage: `const client = new DeepSeekClient({
  apiFormat: 'deepseek',
  baseUrl: 'http://your-server-url',
  token: 'your-api-key-here',
  model: 'deepseek-r1:8b'
});`,
      },
      openai: {
        description: "Official OpenAI API",
        env: `# OpenAI Configuration
API_FORMAT=openai
BASE_URL=https://api.openai.com
API_KEY=your-openai-key-here
MODEL=gpt-4
TIMEOUT=30000`,
        usage: `const client = new DeepSeekClient({
  apiFormat: 'openai',
  baseUrl: 'https://api.openai.com',
  token: 'your-openai-key-here',
  model: 'gpt-4'
});`,
      },
      customOpenai: {
        description: "Custom OpenAI-compatible API",
        env: `# Custom API Configuration
API_FORMAT=openai
BASE_URL=http://your-custom-server
API_KEY=your-custom-key
MODEL=your-model-name
TIMEOUT=30000`,
        usage: `const client = new DeepSeekClient({
  apiFormat: 'openai',
  baseUrl: 'http://your-custom-server',
  token: 'your-custom-key',
  model: 'your-model-name'
});`,
      },
    };
  }
}

module.exports = ConfigHelper;
