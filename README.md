# DeepSeek Client

A friendly and feature-rich client for communicating with DeepSeek models hosted on your private server. This client provides both CLI and programmatic interfaces with support for reusable prompt templates.

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
   ```env
   DEEPSEEK_BASE_URL=http://your-droplet-ip
   DEEPSEEK_TOKEN=your-token-here
   DEEPSEEK_MODEL=deepseek-r1:8b
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

### Programmatic Usage

```javascript
const DeepSeekClient = require('./src/index.js');

// Initialize client
const client = new DeepSeekClient({
  baseUrl: 'http://your-droplet-ip',
  token: 'your-token-here',
  model: 'deepseek-r1:8b'
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
Generate a response from the model.

**Parameters:**
- `prompt` (string) - The prompt to send
- `options` (object, optional)
  - `model` - Override default model
  - `stream` - Enable streaming (boolean)

**Returns:** Promise<object> - The model response

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

## CLI Commands

| Command | Alias | Description | Example |
|---------|-------|-------------|---------|
| `interactive` | `i` | Start interactive mode | `node src/cli.js interactive` |
| `ask <prompt>` | `a` | Send a quick prompt | `node src/cli.js ask "Hello"` |
| `template <name>` | `t` | Use a template | `node src/cli.js template code-review` |
| `list` | `l` | List templates | `node src/cli.js list` |
| `test` | - | Test connection | `node src/cli.js test` |

### CLI Options

- `--model <model>` - Specify model to use
- `--stream` - Enable streaming response
- `--vars <json>` - Template variables in JSON format

## Configuration

You can configure the client using:

1. **Environment variables** (recommended):
   ```env
   DEEPSEEK_BASE_URL=http://your-droplet-ip
   DEEPSEEK_TOKEN=your-token-here
   DEEPSEEK_MODEL=deepseek-r1:8b
   DEEPSEEK_TIMEOUT=30000
   ```

2. **Configuration object**:
   ```javascript
   const client = new DeepSeekClient({
     baseUrl: 'http://your-droplet-ip',
     token: 'your-token-here',
     model: 'deepseek-r1:8b',
     timeout: 30000
   });
   ```

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

// Simple question
const response = await client.generate('What is the capital of France?');
console.log(response.response);
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
   - Make sure `DEEPSEEK_BASE_URL` is set in your `.env` file
   - Check that the URL format is correct: `http://your-droplet-ip`

2. **"Authorization token is required" error**
   - Set `DEEPSEEK_TOKEN` in your `.env` file
   - Verify your token is correct

3. **Connection timeout**
   - Check if your server is running
   - Verify the IP address is correct
   - Check firewall settings

4. **Template not found**
   - Make sure the template file exists in `prompts/` directory
   - Check the file has `.txt` extension
   - Verify file permissions

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

---

Made with ❤️ for the DeepSeek community