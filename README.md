# AI Client - OpenAI & DeepSeek Compatible

A friendly and feature-rich client for communicating with AI models. Supports both OpenAI and DeepSeek API formats. This client provides both CLI and programmatic interfaces with support for reusable prompt templates.

## Features

- 🚀 **Easy Setup**: Simple configuration with environment variables
- 💬 **Interactive CLI**: User-friendly command-line interface
- 📝 **Prompt Templates**: Create and reuse prompt templates with variables
- 🔄 **Streaming Support**: Real-time streaming responses
- 🛠️ **Programmatic API**: Use in your Node.js applications
- 🧪 **Connection Testing**: Built-in connectivity checks
- 📋 **Template Management**: List, create, and manage templates

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your configuration by copying the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your actual values:

   **Configuration:**
   ```env
   # For DeepSeek
   API_FORMAT=deepseek
   BASE_URL=http://your-droplet-ip
   API_KEY=your-deepseek-token
   MODEL=deepseek-r1:8b

   # For OpenAI
   API_FORMAT=openai
   BASE_URL=https://api.openai.com
   API_KEY=your-openai-key
   MODEL=gpt-4

   # For Custom API
   API_FORMAT=openai
   BASE_URL=http://your-custom-server
   API_KEY=your-custom-key
   MODEL=your-model-name
   ```

## Quick Start

### CLI Usage

#### Interactive Mode (Recommended for beginners)
```bash
npm start
# or
node src/cli.js interactive
```

This will launch an interactive menu where you can:
- Send prompts directly
- Use existing templates
- Create new templates
- Test your connection

#### Quick Prompt
```bash
node src/cli.js ask "What is DeepSeek-R1?"
```

#### Using Templates
```bash
# Use a template without variables
node src/cli.js template summarize

# Use a template with variables
node src/cli.js template explain-concept --vars '{"concept":"machine learning","audience":"beginners","level":"basic","context":"for a programming course"}'
```

#### List Available Templates
```bash
node src/cli.js list
```

#### Test Connection
```bash
node src/cli.js test
```

#### Streaming Response
```bash
node src/cli.js ask "Explain quantum computing" --stream
```

#### Configuration Management
```bash
# Show current configuration
node src/cli.js config --show

# Switch to OpenAI format
node src/cli.js config --format openai

# Switch to DeepSeek format
node src/cli.js config --format deepseek

# Interactive configuration setup
node src/cli.js config
```

#### Magento 2 Ticket Analysis
```bash
# Interactive Magento 2 ticket analysis
node src/cli.js magento2

# Quick analysis mode
node src/cli.js magento2 --quick

# Read ticket from file
node src/cli.js magento2 --file ticket.txt
```



### Programmatic Usage

```javascript
const AIClient = require('./src/index.js');

// Initialize client (auto-detects API format from environment)
const client = new AIClient();

// Or specify configuration explicitly
const deepseekClient = new AIClient({
  apiFormat: 'deepseek',
  baseUrl: 'http://your-server-url',
  token: 'your-api-key',
  model: 'deepseek-r1:8b'
});

const openaiClient = new AIClient({
  apiFormat: 'openai',
  baseUrl: 'https://api.openai.com',
  token: 'your-openai-key',
  model: 'gpt-4'
});

// Simple generation
async function example() {
  try {
    // Basic prompt
    const response = await client.generate('What is artificial intelligence?');
    console.log(response.response);

    // Using a template
    const templateResponse = await client.generateFromTemplate('explain-concept', {
      concept: 'neural networks',
      audience: 'developers',
      level: 'intermediate',
      context: 'machine learning project'
    });
    console.log(templateResponse.response);

    // Magento 2 ticket analysis
    const magentoAnalysis = await client.generateFromTemplate('magento2-ticket-analysis', {
      ticket_content: 'Fix checkout bug when using coupon codes',
      ticket_type: 'Bug Fix',
      magento_version: '2.4.6',
      project_context: 'E-commerce store',
      store_config: 'Multi-store setup',
      existing_customizations: 'Custom checkout flow',
      third_party_extensions: 'Payment gateway extensions',
      performance_requirements: 'Standard performance'
    });
    console.log(magentoAnalysis.response);

    // Streaming response
    await client.generateStream('Tell me a story', (chunk) => {
      if (chunk.response) {
        process.stdout.write(chunk.response);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();
```

## Prompt Templates

Templates are stored in the `prompts/` directory as `.txt` files. They support variable substitution using `{{variable}}` syntax.

### Included Templates

1. **code-review.txt** - Code review and feedback
   - Variables: `language`, `context`, `code`

2. **explain-concept.txt** - Detailed concept explanations
   - Variables: `concept`, `audience`, `level`, `context`

3. **brainstorm.txt** - Creative brainstorming sessions
   - Variables: `topic`, `context`, `goals`, `constraints`, `style`, `audience`

4. **summarize.txt** - Content summarization
   - Variables: `content`, `type`, `length`, `audience`, `instructions`

5. **magento2-ticket-analysis.txt** - Comprehensive Magento 2 ticket analysis
   - Variables: `ticket_content`, `ticket_type`, `project_context`, `magento_version`, `store_config`, `existing_customizations`, `third_party_extensions`, `performance_requirements`

6. **magento2-quick-clarify.txt** - Quick Magento 2 ticket clarification
   - Variables: `ticket_content`, `magento_version`, `project_type`


- Git operations
- API integrations

### Creating Custom Templates

Create a new `.txt` file in the `prompts/` directory:

```text
# prompts/my-template.txt
You are a helpful assistant specialized in {{domain}}.

Please help with the following task:
{{task}}

Additional context:
{{context}}

Please provide a detailed response that includes:
1. {{requirement1}}
2. {{requirement2}}
```

Use it with:
```bash
node src/cli.js template my-template --vars '{"domain":"web development","task":"optimize performance","context":"React application","requirement1":"specific recommendations","requirement2":"code examples"}'
```

## API Reference

### DeepSeekClient Class

#### Constructor
```javascript
new DeepSeekClient(config)
```

**Parameters:**
- `config.baseUrl` - Server URL (or use `DEEPSEEK_BASE_URL` env var)
- `config.token` - Authorization token (or use `DEEPSEEK_TOKEN` env var)
- `config.model` - Default model name (optional, default: `deepseek-r1:8b`)
- `config.timeout` - Request timeout in ms (optional, default: `30000`)

#### Methods

##### `generate(prompt, options)`
Generate a response from the model (works with both API formats).

**Parameters:**
- `prompt` (string) - The prompt to send
- `options` (object, optional)
  - `model` - Override default model
  - `stream` - Enable streaming (boolean)
  - `temperature` - Control randomness (OpenAI format)
  - `max_tokens` - Maximum tokens (OpenAI format)

**Returns:** Promise<object> - The model response (normalized format)

##### `generateStream(prompt, onChunk, options)`
Generate a streaming response.

**Parameters:**
- `prompt` (string) - The prompt to send
- `onChunk` (function) - Callback for each chunk: `(chunk) => {}`
- `options` (object, optional) - Same as `generate()`

##### `loadPromptTemplate(templateName)`
Load a prompt template from the prompts directory.

**Parameters:**
- `templateName` (string) - Template name without `.txt` extension

**Returns:** Promise<string> - Template content

##### `generateFromTemplate(templateName, variables, options)`
Generate using a template with variable substitution.

**Parameters:**
- `templateName` (string) - Template name
- `variables` (object) - Variables to substitute
- `options` (object, optional) - Same as `generate()`

##### `listPromptTemplates()`
List available prompt templates.

**Returns:** Promise<string[]> - Array of template names

##### `savePromptTemplate(templateName, content)`
Save a new prompt template.

**Parameters:**
- `templateName` (string) - Template name
- `content` (string) - Template content

##### `testConnection()`
Test connection to the server.

**Returns:** Promise<boolean> - Connection status

##### `setApiFormat(format)`
Change API format dynamically.

**Parameters:**
- `format` (string) - 'openai' or 'deepseek'

##### `getApiFormat()`
Get current API format.

**Returns:** string - Current API format ('openai' or 'deepseek')



## CLI Commands

| Command | Alias | Description | Example |
|---------|-------|-------------|---------|
| `interactive` | `i` | Start interactive mode | `node src/cli.js interactive` |
| `ask <prompt>` | `a` | Send a quick prompt | `node src/cli.js ask "Hello"` |
| `template <name>` | `t` | Use a template | `node src/cli.js template code-review` |
| `list` | `l` | List templates | `node src/cli.js list` |
| `test` | - | Test connection | `node src/cli.js test` |
| `config` | `c` | Manage API configuration | `node src/cli.js config` |
| `magento2` | `m2` | Analyze Magento 2 tickets | `node src/cli.js magento2` |

### CLI Options

- `--model <model>` - Specify model to use
- `--stream` - Enable streaming response
- `--vars <json>` - Template variables in JSON format
- `--show` - Show current configuration (config command)
- `--format <format>` - Switch API format (config command)
- `--quick` - Quick analysis mode (magento2 command)


## Configuration

### API Format Support

The client supports both OpenAI and DeepSeek API formats:

**Configuration:**
The client uses universal environment variables that work with any AI service:
- `BASE_URL` - Your AI service endpoint
- `API_KEY` - Your authentication token
- `MODEL` - Model name to use
- `API_FORMAT` - Service type (deepseek/openai)

**API Format Support:**
- **DeepSeek Format**: `/api/generate` endpoint with prompt-based requests
- **OpenAI Format**: `/v1/chat/completions` endpoint with message-based requests
- **Auto-Detection**: Automatically detects format from URL patterns

### Configuration Options

1. **Environment variables**:

   ```env
   API_FORMAT=deepseek
   BASE_URL=http://your-server-url
   API_KEY=your-api-key-here
   MODEL=your-model-name
   TIMEOUT=30000
   ```

2. **Configuration object**:
   ```javascript
   // DeepSeek configuration
   const client = new AIClient({
     apiFormat: 'deepseek',
     baseUrl: 'http://your-server-url',
     token: 'your-api-key',
     model: 'your-model-name'
   });

   // OpenAI configuration
   const openaiClient = new AIClient({
     apiFormat: 'openai',
     baseUrl: 'https://api.openai.com',
     token: 'your-openai-key',
     model: 'gpt-4'
   });
   ```

3. **Auto-detection**: If `API_FORMAT` is not set, the client auto-detects based on:
   - Base URL patterns (detects `openai.com`)
   - Defaults to DeepSeek format

## Error Handling

The client provides detailed error messages for common issues:

- **Connection errors**: Network connectivity problems
- **Authentication errors**: Invalid or missing tokens
- **API errors**: Server-side errors with status codes
- **Template errors**: Missing or invalid templates

Example error handling:
```javascript
try {
  const response = await client.generate('Hello');
} catch (error) {
  if (error.message.includes('Network Error')) {
    console.log('Check your server URL and network connection');
  } else if (error.message.includes('API Error: 401')) {
    console.log('Check your authorization token');
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## Examples

### Basic Usage
```javascript
const client = new DeepSeekClient();

// Simple question (works with both APIs)
const response = await client.generate('What is the capital of France?');
console.log(response.response);

// Check current API format
console.log('Using API format:', client.getApiFormat());
```

### Configuration Examples
```javascript
// Universal configuration approach
const createClient = (format, url, key, model) => {
  return new AIClient({
    apiFormat: format,
    baseUrl: url,
    token: key,
    model: model
  });
};

// DeepSeek server
const deepseekClient = createClient(
  'deepseek',
  'http://your-server-url',
  'your-api-key',
  'deepseek-r1:8b'
);

// OpenAI service
const openaiClient = createClient(
  'openai',
  'https://api.openai.com',
  'your-openai-key',
  'gpt-4'
);

// Custom API
const customClient = createClient(
  'openai',
  'http://your-custom-server',
  'your-custom-key',
  'your-model'
);

// All work the same way
const response1 = await deepseekClient.generate('Hello');
const response2 = await openaiClient.generate('Hello');
const response3 = await customClient.generate('Hello');
```



### Code Review
```javascript
const codeReview = await client.generateFromTemplate('code-review', {
  language: 'javascript',
  context: 'React component for user authentication',
  code: `
function LoginForm({ onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
  `
});
```

### Magento 2 Ticket Analysis
```javascript
// Analyze a feature request ticket
const featureAnalysis = await client.generateFromTemplate('magento2-ticket-analysis', {
  ticket_content: `
    Title: Add product comparison feature
    
    As a customer, I want to compare products side by side
    so I can make better purchasing decisions.
    
    Requirements:
    - Compare up to 4 products
    - Show key attributes in table format
    - Add compare button on category pages
  `,
  ticket_type: 'Feature Request',
  project_context: 'Fashion e-commerce store',
  magento_version: '2.4.6',
  store_config: 'Multi-store setup with 3 store views',
  existing_customizations: 'Custom product page layout',
  third_party_extensions: 'Amasty SEO suite',
  performance_requirements: 'Page load under 3 seconds'
});

// Quick ticket clarification
const quickAnalysis = await client.generateFromTemplate('magento2-quick-clarify', {
  ticket_content: 'Shopping cart is broken',
  magento_version: '2.4.5',
  project_type: 'B2B e-commerce'
});
```

### Streaming Response
```javascript
console.log('Assistant: ');
await client.generateStream('Write a short poem about technology', (chunk) => {
  if (chunk.response) {
    process.stdout.write(chunk.response);
  }
});
console.log('\n');
```

## Troubleshooting

### Common Issues

1. **"Base URL is required" error**
   - Set `BASE_URL` in your `.env` file
   - Check URL format is correct (include `http://` or `https://`)

2. **"Authorization token is required" error**
   - Set `API_KEY` in your `.env` file
   - Verify your token/key is correct

3. **API format confusion**
   - Run `node src/cli.js config --show` to check current format
   - Use `node src/cli.js config --format openai` to switch formats
   - Check that model names match the API format



3. **Connection timeout**
   - Check if your server is running
   - Verify the IP address is correct
   - Check firewall settings

4. **Template not found**
   - Make sure the template file exists in `prompts/` directory
   - Check the file has `.txt` extension
   - Verify file permissions

### Configuration Management

Use the config command for easy setup:
```bash
# Show current configuration and validation
node src/cli.js config --show

# Interactive configuration setup
node src/cli.js config

# Switch between API formats
node src/cli.js config --format openai
node src/cli.js config --format deepseek
```

### Debug Mode

Set the `DEBUG` environment variable for verbose logging:
```bash
DEBUG=deepseek* node src/cli.js test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Verify your configuration
3. Test the connection with `node src/cli.js test`
4. Check server logs for additional information

## Configuration Format

The client uses platform-agnostic environment variables:

```bash
# Configure your environment
API_FORMAT=deepseek
BASE_URL=http://your-server-url
API_KEY=your-api-key
MODEL=your-model-name
```

## API Compatibility

This client abstracts the differences between API formats:

| Feature | DeepSeek Format | OpenAI Format | Client Support |
|---------|----------------|---------------|----------------|
| Basic generation | ✅ | ✅ | ✅ Unified interface |
| Streaming | ✅ | ✅ | ✅ Same callback format |
| Templates | ✅ | ✅ | ✅ Works with both |
| Error handling | ✅ | ✅ | ✅ Normalized errors |
| Model parameters | ✅ | ✅ | ✅ Format-specific options |

---



Made with ❤️ for the AI development community