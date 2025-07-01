const WebSocket = require("ws");
const EventEmitter = require("events");

class MCPClient extends EventEmitter {
  constructor(config = {}) {
    super();

    this.serverUrl = config.serverUrl;
    this.transport = config.transport || "stdio"; // 'stdio', 'sse', 'websocket'
    this.timeout = config.timeout || 30000;
    this.reconnectDelay = config.reconnectDelay || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;

    this.connection = null;
    this.isConnected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.tools = new Map();
    this.resources = new Map();
    this.prompts = new Map();

    this.reconnectAttempts = 0;
    this.shouldReconnect = true;
  }

  /**
   * Connect to MCP server
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      switch (this.transport) {
        case "sse":
          await this._connectSSE();
          break;
        case "websocket":
          await this._connectWebSocket();
          break;
        case "stdio":
          await this._connectStdio();
          break;
        default:
          throw new Error(`Unsupported transport: ${this.transport}`);
      }

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("connected");

      // Initialize session
      await this._initialize();
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  /**
   * Disconnect from MCP server
   * @returns {Promise<void>}
   */
  async disconnect() {
    this.shouldReconnect = false;
    this.isConnected = false;

    if (this.connection) {
      switch (this.transport) {
        case "websocket":
          this.connection.close();
          break;
        case "sse":
          if (this.connection && this.connection.close) {
            this.connection.close();
          }
          break;
        case "stdio":
          if (this.connection.kill) {
            this.connection.kill();
          }
          break;
      }
      this.connection = null;
    }

    // Reject all pending requests
    for (const [id, { reject }] of this.pendingRequests) {
      reject(new Error("Connection closed"));
    }
    this.pendingRequests.clear();

    this.emit("disconnected");
  }

  /**
   * Send request to MCP server
   * @param {string} method - JSON-RPC method
   * @param {object} params - Request parameters
   * @returns {Promise<object>} - Response
   */
  async sendRequest(method, params = {}) {
    if (!this.isConnected) {
      throw new Error("Not connected to MCP server");
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error("Request timeout"));
      }, this.timeout);

      this.pendingRequests.set(id, { resolve, reject, timeoutId });

      // Send request
      this._sendMessage(request);
    });
  }

  /**
   * Send notification to MCP server
   * @param {string} method - JSON-RPC method
   * @param {object} params - Notification parameters
   */
  sendNotification(method, params = {}) {
    if (!this.isConnected) {
      throw new Error("Not connected to MCP server");
    }

    const notification = {
      jsonrpc: "2.0",
      method,
      params,
    };

    this._sendMessage(notification);
  }

  /**
   * List available tools
   * @returns {Promise<Array>} - Array of tool definitions
   */
  async listTools() {
    try {
      const response = await this.sendRequest("tools/list");
      const tools = response.tools || [];

      // Cache tools
      this.tools.clear();
      for (const tool of tools) {
        this.tools.set(tool.name, tool);
      }

      return tools;
    } catch (error) {
      throw new Error(`Failed to list tools: ${error.message}`);
    }
  }

  /**
   * Call a tool
   * @param {string} name - Tool name
   * @param {object} arguments - Tool arguments
   * @returns {Promise<object>} - Tool result
   */
  async callTool(name, args = {}) {
    try {
      const response = await this.sendRequest("tools/call", {
        name,
        arguments: args,
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to call tool '${name}': ${error.message}`);
    }
  }

  /**
   * List available resources
   * @returns {Promise<Array>} - Array of resource definitions
   */
  async listResources() {
    try {
      const response = await this.sendRequest("resources/list");
      const resources = response.resources || [];

      // Cache resources
      this.resources.clear();
      for (const resource of resources) {
        this.resources.set(resource.uri, resource);
      }

      return resources;
    } catch (error) {
      throw new Error(`Failed to list resources: ${error.message}`);
    }
  }

  /**
   * Read a resource
   * @param {string} uri - Resource URI
   * @returns {Promise<object>} - Resource content
   */
  async readResource(uri) {
    try {
      const response = await this.sendRequest("resources/read", { uri });
      return response;
    } catch (error) {
      throw new Error(`Failed to read resource '${uri}': ${error.message}`);
    }
  }

  /**
   * List available prompts
   * @returns {Promise<Array>} - Array of prompt definitions
   */
  async listPrompts() {
    try {
      const response = await this.sendRequest("prompts/list");
      const prompts = response.prompts || [];

      // Cache prompts
      this.prompts.clear();
      for (const prompt of prompts) {
        this.prompts.set(prompt.name, prompt);
      }

      return prompts;
    } catch (error) {
      throw new Error(`Failed to list prompts: ${error.message}`);
    }
  }

  /**
   * Get a prompt
   * @param {string} name - Prompt name
   * @param {object} arguments - Prompt arguments
   * @returns {Promise<object>} - Prompt content
   */
  async getPrompt(name, args = {}) {
    try {
      const response = await this.sendRequest("prompts/get", {
        name,
        arguments: args,
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to get prompt '${name}': ${error.message}`);
    }
  }

  /**
   * Subscribe to resource updates
   * @param {string} uri - Resource URI
   * @returns {Promise<void>}
   */
  async subscribeToResource(uri) {
    try {
      await this.sendRequest("resources/subscribe", { uri });
    } catch (error) {
      throw new Error(
        `Failed to subscribe to resource '${uri}': ${error.message}`,
      );
    }
  }

  /**
   * Unsubscribe from resource updates
   * @param {string} uri - Resource URI
   * @returns {Promise<void>}
   */
  async unsubscribeFromResource(uri) {
    try {
      await this.sendRequest("resources/unsubscribe", { uri });
    } catch (error) {
      throw new Error(
        `Failed to unsubscribe from resource '${uri}': ${error.message}`,
      );
    }
  }

  /**
   * Get server info
   * @returns {Promise<object>} - Server information
   */
  async getServerInfo() {
    try {
      const response = await this.sendRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        clientInfo: {
          name: "ai-client",
          version: "2.0.0",
        },
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to get server info: ${error.message}`);
    }
  }

  /**
   * Get cached tools
   * @returns {Map} - Cached tools
   */
  getCachedTools() {
    return this.tools;
  }

  /**
   * Get cached resources
   * @returns {Map} - Cached resources
   */
  getCachedResources() {
    return this.resources;
  }

  /**
   * Get cached prompts
   * @returns {Map} - Cached prompts
   */
  getCachedPrompts() {
    return this.prompts;
  }

  // Private methods

  /**
   * Initialize MCP session
   * @private
   */
  async _initialize() {
    try {
      const serverInfo = await this.getServerInfo();
      this.emit("initialized", serverInfo);

      // Load initial data
      await Promise.all([
        this.listTools().catch(() => {}),
        this.listResources().catch(() => {}),
        this.listPrompts().catch(() => {}),
      ]);
    } catch (error) {
      this.emit("error", new Error(`Initialization failed: ${error.message}`));
    }
  }

  /**
   * Connect via Server-Sent Events
   * @private
   */
  async _connectSSE() {
    try {
      const EventSource = require("eventsource");

      return new Promise((resolve, reject) => {
        this.connection = new EventSource(this.serverUrl);

        this.connection.onopen = () => {
          resolve();
        };

        this.connection.onmessage = (event) => {
          try {
            this._handleMessage(JSON.parse(event.data));
          } catch (error) {
            this.emit(
              "error",
              new Error(`Failed to parse SSE message: ${error.message}`),
            );
          }
        };

        this.connection.onerror = (error) => {
          this.emit("error", error);
          this._handleReconnect();
        };
      });
    } catch (error) {
      throw new Error(
        `SSE transport requires 'eventsource' package: npm install eventsource`,
      );
    }
  }

  /**
   * Connect via WebSocket
   * @private
   */
  async _connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.connection = new WebSocket(this.serverUrl);

      this.connection.on("open", () => {
        resolve();
      });

      this.connection.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this._handleMessage(message);
        } catch (error) {
          this.emit(
            "error",
            new Error(`Failed to parse message: ${error.message}`),
          );
        }
      });

      this.connection.on("error", (error) => {
        this.emit("error", error);
        reject(error);
      });

      this.connection.on("close", () => {
        this.isConnected = false;
        this.emit("disconnected");
        this._handleReconnect();
      });
    });
  }

  /**
   * Connect via stdio
   * @private
   */
  async _connectStdio() {
    const { spawn } = require("child_process");

    return new Promise((resolve, reject) => {
      // Parse server command
      const [command, ...args] = this.serverUrl.split(" ");

      this.connection = spawn(command, args, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.connection.on("spawn", () => {
        resolve();
      });

      this.connection.on("error", (error) => {
        this.emit("error", error);
        reject(error);
      });

      this.connection.on("exit", (code) => {
        this.isConnected = false;
        this.emit("disconnected");
        if (code !== 0) {
          this.emit("error", new Error(`Server exited with code ${code}`));
        }
        this._handleReconnect();
      });

      // Handle stdout messages
      let buffer = "";
      this.connection.stdout.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line);
              this._handleMessage(message);
            } catch (error) {
              this.emit(
                "error",
                new Error(`Failed to parse message: ${error.message}`),
              );
            }
          }
        }
      });

      // Handle stderr
      this.connection.stderr.on("data", (data) => {
        this.emit("error", new Error(`Server stderr: ${data.toString()}`));
      });
    });
  }

  /**
   * Send message to server
   * @private
   */
  _sendMessage(message) {
    const messageStr = JSON.stringify(message);

    switch (this.transport) {
      case "websocket":
        this.connection.send(messageStr);
        break;
      case "stdio":
        this.connection.stdin.write(messageStr + "\n");
        break;
      case "sse":
        // SSE is typically read-only, would need separate HTTP endpoint for sending
        throw new Error(
          "SSE transport does not support sending messages. Use WebSocket or stdio for bidirectional communication.",
        );
    }
  }

  /**
   * Handle incoming message
   * @private
   */
  _handleMessage(message) {
    if (message.id && this.pendingRequests.has(message.id)) {
      // Response to request
      const { resolve, reject, timeoutId } = this.pendingRequests.get(
        message.id,
      );
      this.pendingRequests.delete(message.id);
      clearTimeout(timeoutId);

      if (message.error) {
        reject(new Error(message.error.message || "Unknown error"));
      } else {
        resolve(message.result || {});
      }
    } else if (!message.id) {
      // Notification
      this._handleNotification(message);
    }
  }

  /**
   * Handle notification from server
   * @private
   */
  _handleNotification(notification) {
    const { method, params } = notification;

    switch (method) {
      case "notifications/resources/updated":
        this.emit("resource_updated", params);
        break;
      case "notifications/resources/list_changed":
        this.emit("resources_changed", params);
        // Refresh resource list
        this.listResources().catch(() => {});
        break;
      case "notifications/tools/list_changed":
        this.emit("tools_changed", params);
        // Refresh tool list
        this.listTools().catch(() => {});
        break;
      case "notifications/prompts/list_changed":
        this.emit("prompts_changed", params);
        // Refresh prompt list
        this.listPrompts().catch(() => {});
        break;
      default:
        this.emit("notification", notification);
    }
  }

  /**
   * Handle reconnection
   * @private
   */
  async _handleReconnect() {
    if (
      !this.shouldReconnect ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return;
    }

    this.reconnectAttempts++;
    this.emit("reconnecting", this.reconnectAttempts);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        this.emit(
          "error",
          new Error(
            `Reconnection attempt ${this.reconnectAttempts} failed: ${error.message}`,
          ),
        );
      }
    }, this.reconnectDelay);
  }
}

module.exports = MCPClient;
