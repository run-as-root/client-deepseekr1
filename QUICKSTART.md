# Quick Start Guide

Get up and running with the DeepSeek Client in 5 minutes! 🚀

## Prerequisites

- Node.js 14+ installed
- Your DeepSeek server running on DigitalOcean
- Your server IP address and authorization token

## Installation & Setup

### Option 1: Automated Setup (Recommended)
```bash
# Clone or download the project
cd client-for-digitalocean-deepseekr1

# Run the automated setup
npm run setup
```

The setup script will:
- Install dependencies
- Create your `.env` configuration file
- Test your connection
- Show usage examples

### Option 2: Manual Setup
```bash
# Install dependencies
npm install

# Copy and edit configuration
cp .env.example .env
# Edit .env with your server details

# Test connection
node src/cli.js test
```

## Your First Request

### Interactive Mode (Easiest)
```bash
npm start
```

This opens a friendly menu where you can:
- Send prompts
- Use templates
- Create new templates

### Command Line
```bash
# Quick question
node src/cli.js ask "What is DeepSeek-R1?"

# Use a template
node src/cli.js template explain-concept

# List available templates
node src/cli.js list
```

## Configuration

Edit your `.env` file:
```env
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here
DEEPSEEK_MODEL=deepseek-r1:8b
```

## Using Templates

Templates make reusable prompts with variables:

### Built-in Templates
- `code-review` - Review code and provide feedback
- `explain-concept` - Detailed explanations
- `brainstorm` - Creative brainstorming
- `summarize` - Content summarization

### Example: Code Review
```bash
node src/cli.js template code-review --vars '{
  "language": "javascript",
  "context": "React component",
  "code": "function MyComponent() { return <div>Hello</div>; }"
}'
```

### Create Custom Template
1. Create `prompts/my-template.txt`
2. Use `{{variable}}` syntax for placeholders
3. Use with: `node src/cli.js template my-template`

## Programmatic Usage

```javascript
const DeepSeekClient = require('./src/index.js');

const client = new DeepSeekClient();

// Simple request
const response = await client.generate('Hello, AI!');
console.log(response.response);

// Using template
const result = await client.generateFromTemplate('explain-concept', {
  concept: 'machine learning',
  audience: 'beginners'
});
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm start` | Interactive mode |
| `node src/cli.js ask "prompt"` | Quick question |
| `node src/cli.js test` | Test connection |
| `node src/cli.js list` | Show templates |
| `node examples/basic-usage.js` | Run examples |

## Troubleshooting

### Connection Issues
```bash
# Test your connection
node src/cli.js test

# Check configuration
cat .env
```

### Common Fixes
- Verify server IP is correct
- Check token is valid
- Ensure server is running
- Check firewall settings

## Next Steps

1. **Explore Templates**: Try different built-in templates
2. **Create Custom Templates**: Add your own in `prompts/`
3. **Integrate**: Use the client in your applications
4. **Advanced Features**: Try streaming responses

## Need Help?

- Check `README.md` for detailed documentation
- Run `node src/cli.js --help` for all options
- Look at `examples/basic-usage.js` for code examples

## Quick Tips

💡 **Use Interactive Mode**: It's the easiest way to get started
📝 **Templates Save Time**: Create reusable prompts for common tasks  
🔄 **Try Streaming**: Use `--stream` for real-time responses
🧪 **Test First**: Always run `node src/cli.js test` after setup

Happy chatting with DeepSeek! 🤖✨