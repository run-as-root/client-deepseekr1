const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class AIClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.BASE_URL;
    this.token = config.token || process.env.API_KEY;
    this.model = config.model || process.env.MODEL;
    this.timeout = config.timeout || parseInt(process.env.TIMEOUT);

    // Determine API format - default to DeepSeek
    this.apiFormat = config.apiFormat || process.env.API_FORMAT || "deepseek";

    // Auto-detect API format based on base URL if not explicitly set
    if (!config.apiFormat && !process.env.API_FORMAT) {
      if (
        this.baseUrl &&
        (this.baseUrl.includes("openai.com") ||
          this.baseUrl.includes("api.openai"))
      ) {
        this.apiFormat = "openai";
      }
    }

    if (!this.baseUrl) {
      throw new Error(
        "Base URL is required. Set BASE_URL environment variable or pass baseUrl in config.",
      );
    }

    if (!this.token) {
      throw new Error(
        "Authorization token is required. Set API_KEY environment variable or pass token in config.",
      );
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  /**
   * Generate a response from the model (supports both OpenAI and DeepSeek formats)
   * @param {string} prompt - The prompt to send to the model
   * @param {object} options - Additional options
   * @returns {Promise<object>} - The response from the model
   */
  async generate(prompt, options = {}) {
    try {
      const requestData = this._formatRequest(prompt, options);
      const endpoint = this._getEndpoint(options.stream);

      const response = await this.client.post(endpoint, requestData);
      return this._formatResponse(response.data);
    } catch (error) {
      if (error.response) {
        const errorMessage = this._extractErrorMessage(error.response);
        throw new Error(
          `API Error: ${error.response.status} - ${errorMessage}`,
        );
      } else if (error.request) {
        throw new Error(
          "Network Error: Unable to reach the server. Please check your connection and server URL." +
            error.message,
        );
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  /**
   * Generate a streaming response from the model (supports both OpenAI and DeepSeek formats)
   * @param {string} prompt - The prompt to send to the model
   * @param {function} onChunk - Callback function for each chunk
   * @param {object} options - Additional options
   * @returns {Promise<void>}
   */
  async generateStream(prompt, onChunk, options = {}) {
    try {
      const requestData = this._formatRequest(prompt, {
        ...options,
        stream: true,
      });
      const endpoint = this._getEndpoint(true);

      const response = await this.client.post(endpoint, requestData, {
        responseType: "stream",
      });

      return new Promise((resolve, reject) => {
        let buffer = "";

        response.data.on("data", (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsedChunk = this._parseStreamChunk(line);
                if (parsedChunk) {
                  onChunk(parsedChunk);
                  if (
                    parsedChunk.done ||
                    (this.apiFormat === "openai" &&
                      parsedChunk.choices?.[0]?.finish_reason)
                  ) {
                    resolve();
                    return;
                  }
                }
              } catch (parseError) {
                // Skip invalid JSON lines
              }
            }
          }
        });

        response.data.on("end", () => {
          resolve();
        });

        response.data.on("error", (error) => {
          reject(new Error(`Stream Error: ${error.message}`));
        });
      });
    } catch (error) {
      if (error.response) {
        const errorMessage = this._extractErrorMessage(error.response);
        throw new Error(
          `API Error: ${error.response.status} - ${errorMessage}`,
        );
      } else if (error.request) {
        throw new Error(
          "Network Error: Unable to reach the server. Please check your connection and server URL.",
        );
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
    const promptPath = path.join(
      process.cwd(),
      "prompts",
      `${templateName}.txt`,
    );
    try {
      const content = await fs.readFile(promptPath, "utf8");
      return content.trim();
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(
          `Prompt template '${templateName}' not found. Create a file at prompts/${templateName}.txt`,
        );
      }
      throw new Error(`Error loading prompt template: ${error.message}`);
    }
  }

  /**
   * List available prompt templates
   * @returns {Promise<string[]>} - Array of template names
   */
  async listPromptTemplates() {
    const promptsDir = path.join(process.cwd(), "prompts");
    try {
      const files = await fs.readdir(promptsDir);
      return files
        .filter((file) => file.endsWith(".txt"))
        .map((file) => file.replace(".txt", ""));
    } catch (error) {
      if (error.code === "ENOENT") {
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
    const promptsDir = path.join(process.cwd(), "prompts");
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
   * Test connection to the server
   * @returns {Promise<boolean>} - True if connection is successful
   */
  async testConnection() {
    try {
      await this.generate("Test connection", { model: this.model });
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
      const infoEndpoint =
        this.apiFormat === "openai" ? "/v1/models" : "/api/info";
      const response = await this.client.get(infoEndpoint);
      return response.data;
    } catch (error) {
      // If info endpoint doesn't exist, return basic info
      return {
        status: "connected",
        model: this.model,
        baseUrl: this.baseUrl,
        apiFormat: this.apiFormat,
      };
    }
  }

  /**
   * Format request based on API format
   * @private
   */
  _formatRequest(prompt, options = {}) {
    const model = options.model || this.model;
    const stream = options.stream || false;

    if (this.apiFormat === "openai") {
      const requestData = {
        model: model,
        messages: [{ role: "user", content: prompt }],
        stream: stream,
      };

      // Add optional OpenAI parameters
      if (options.temperature !== undefined)
        requestData.temperature = options.temperature;
      if (options.max_tokens !== undefined)
        requestData.max_tokens = options.max_tokens;
      if (options.top_p !== undefined) requestData.top_p = options.top_p;
      if (options.frequency_penalty !== undefined)
        requestData.frequency_penalty = options.frequency_penalty;
      if (options.presence_penalty !== undefined)
        requestData.presence_penalty = options.presence_penalty;

      return requestData;
    } else {
      // DeepSeek format (default)
      return {
        model: model,
        prompt: prompt,
        stream: stream,
        ...options,
      };
    }
  }

  /**
   * Get appropriate endpoint based on API format
   * @private
   */
  _getEndpoint(isStream = false) {
    if (this.apiFormat === "openai") {
      return "/v1/chat/completions";
    } else {
      return "/api/generate";
    }
  }

  /**
   * Format response based on API format
   * @private
   */
  _formatResponse(data) {
    if (this.apiFormat === "openai") {
      // Convert OpenAI format to unified format
      return {
        response: data.choices?.[0]?.message?.content || "",
        model: data.model,
        created: data.created,
        usage: data.usage,
        id: data.id,
        // Keep original data for compatibility
        _original: data,
      };
    } else {
      // DeepSeek format - return as is
      return data;
    }
  }

  /**
   * Parse streaming chunk based on API format
   * @private
   */
  _parseStreamChunk(line) {
    if (this.apiFormat === "openai") {
      // OpenAI streaming format
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") {
          return { done: true };
        }
        try {
          const parsed = JSON.parse(data);
          return {
            response: parsed.choices?.[0]?.delta?.content || "",
            done: parsed.choices?.[0]?.finish_reason !== null,
            _original: parsed,
          };
        } catch (e) {
          return null;
        }
      }
      return null;
    } else {
      // DeepSeek format
      return JSON.parse(line);
    }
  }

  /**
   * Extract error message from response based on API format
   * @private
   */
  _extractErrorMessage(response) {
    if (this.apiFormat === "openai") {
      return response.data?.error?.message || response.statusText;
    } else {
      return response.data?.error || response.statusText;
    }
  }

  /**
   * Set API format
   * @param {string} format - 'openai' or 'deepseek'
   */
  setApiFormat(format) {
    if (!["openai", "deepseek"].includes(format)) {
      throw new Error('API format must be either "openai" or "deepseek"');
    }
    this.apiFormat = format;
  }

  /**
   * Get current API format
   * @returns {string} - Current API format
   */
  getApiFormat() {
    return this.apiFormat;
  }
}

module.exports = AIClient;
