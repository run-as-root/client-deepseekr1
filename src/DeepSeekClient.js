const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class DeepSeekClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.DEEPSEEK_BASE_URL;
    this.token = config.token || process.env.DEEPSEEK_TOKEN;
    this.model = config.model || 'deepseek-r1:8b';
    this.timeout = config.timeout || 30000;

    if (!this.baseUrl) {
      throw new Error('Base URL is required. Set DEEPSEEK_BASE_URL environment variable or pass baseUrl in config.');
    }

    if (!this.token) {
      throw new Error('Authorization token is required. Set DEEPSEEK_TOKEN environment variable or pass token in config.');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  /**
   * Generate a response from the DeepSeek model
   * @param {string} prompt - The prompt to send to the model
   * @param {object} options - Additional options
   * @returns {Promise<object>} - The response from the model
   */
  async generate(prompt, options = {}) {
    try {
      const requestData = {
        model: options.model || this.model,
        prompt: prompt,
        stream: options.stream || false,
        ...options
      };

      const response = await this.client.post('/api/generate', requestData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Unable to reach the server. Please check your connection and server URL.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  /**
   * Generate a streaming response from the DeepSeek model
   * @param {string} prompt - The prompt to send to the model
   * @param {function} onChunk - Callback function for each chunk
   * @param {object} options - Additional options
   * @returns {Promise<void>}
   */
  async generateStream(prompt, onChunk, options = {}) {
    try {
      const requestData = {
        model: options.model || this.model,
        prompt: prompt,
        stream: true,
        ...options
      };

      const response = await this.client.post('/api/generate', requestData, {
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        let buffer = '';

        response.data.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                onChunk(data);
                if (data.done) {
                  resolve();
                  return;
                }
              } catch (parseError) {
                // Skip invalid JSON lines
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve();
        });

        response.data.on('error', (error) => {
          reject(new Error(`Stream Error: ${error.message}`));
        });
      });
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Unable to reach the server. Please check your connection and server URL.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  /**
   * Load a prompt template from the prompts directory
   * @param {string} templateName - Name of the template file (without .txt extension)
   * @returns {Promise<string>} - The template content
   */
  async loadPromptTemplate(templateName) {
    const promptPath = path.join(process.cwd(), 'prompts', `${templateName}.txt`);
    try {
      const content = await fs.readFile(promptPath, 'utf8');
      return content.trim();
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Prompt template '${templateName}' not found. Create a file at prompts/${templateName}.txt`);
      }
      throw new Error(`Error loading prompt template: ${error.message}`);
    }
  }

  /**
   * List available prompt templates
   * @returns {Promise<string[]>} - Array of template names
   */
  async listPromptTemplates() {
    const promptsDir = path.join(process.cwd(), 'prompts');
    try {
      const files = await fs.readdir(promptsDir);
      return files
        .filter(file => file.endsWith('.txt'))
        .map(file => file.replace('.txt', ''));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Error listing prompt templates: ${error.message}`);
    }
  }

  /**
   * Save a new prompt template
   * @param {string} templateName - Name of the template
   * @param {string} content - Template content
   * @returns {Promise<void>}
   */
  async savePromptTemplate(templateName, content) {
    const promptsDir = path.join(process.cwd(), 'prompts');
    const promptPath = path.join(promptsDir, `${templateName}.txt`);

    try {
      await fs.mkdir(promptsDir, { recursive: true });
      await fs.writeFile(promptPath, content.trim());
    } catch (error) {
      throw new Error(`Error saving prompt template: ${error.message}`);
    }
  }

  /**
   * Replace placeholders in a template with actual values
   * @param {string} template - Template string with {{placeholder}} syntax
   * @param {object} variables - Object with variable values
   * @returns {string} - Template with replaced variables
   */
  replaceTemplateVariables(template, variables = {}) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  /**
   * Generate response using a prompt template
   * @param {string} templateName - Name of the template
   * @param {object} variables - Variables to replace in template
   * @param {object} options - Generation options
   * @returns {Promise<object>} - The response from the model
   */
  async generateFromTemplate(templateName, variables = {}, options = {}) {
    const template = await this.loadPromptTemplate(templateName);
    const prompt = this.replaceTemplateVariables(template, variables);
    return this.generate(prompt, options);
  }

  /**
   * Test connection to the DeepSeek server
   * @returns {Promise<boolean>} - True if connection is successful
   */
  async testConnection() {
    try {
      await this.generate('Test connection', { model: this.model });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get server information (if available)
   * @returns {Promise<object>} - Server information
   */
  async getServerInfo() {
    try {
      const response = await this.client.get('/api/info');
      return response.data;
    } catch (error) {
      // If info endpoint doesn't exist, return basic info
      return {
        status: 'connected',
        model: this.model,
        baseUrl: this.baseUrl
      };
    }
  }
}

module.exports = DeepSeekClient;
