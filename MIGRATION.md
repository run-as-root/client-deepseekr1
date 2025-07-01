# Migration Guide - OpenAI Compatibility Update

This guide helps you migrate from the DeepSeek-only version to the new OpenAI-compatible version while maintaining full backward compatibility.

## 🎯 What's New

- ✅ **OpenAI API Support** - Use official OpenAI API or compatible services
- ✅ **Dual Format Support** - Switch between DeepSeek and OpenAI formats
- ✅ **Auto-Detection** - Automatically detects API format from configuration
- ✅ **Full Backward Compatibility** - Existing DeepSeek setups work unchanged
- ✅ **Configuration Management** - Easy switching between API formats

## 🚀 No Breaking Changes

**Your existing setup continues to work exactly as before!**

If you have:
```env
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here
DEEPSEEK_MODEL=deepseek-r1:8b
```

Everything will continue working without any changes.

## 📋 Step-by-Step Migration

### Step 1: Update (Optional but Recommended)

Add explicit API format to your `.env` file:

```env
# Add this line to make your configuration explicit
API_FORMAT=deepseek

# Your existing configuration (no changes needed)
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here
DEEPSEEK_MODEL=deepseek-r1:8b
DEEPSEEK_TIMEOUT=30000
```

### Step 2: Test Current Setup

Verify everything still works:

```bash
# Test your existing configuration
node src/cli.js test

# Should show:
# ✅ Connection successful!
# 📡 Server: http://your-droplet-ip
# 🤖 Model: deepseek-r1:8b
# 🔧 API Format: deepseek
```

### Step 3: Explore New Features (Optional)

Try the new configuration management:

```bash
# Show current configuration
node src/cli.js config --show

# See all available options
node src/cli.js config --help
```

## 🆕 Using OpenAI Format

If you want to use OpenAI API or OpenAI-compatible services:

### Option 1: Interactive Setup
```bash
node src/cli.js config
```

### Option 2: Manual Configuration

Add to your `.env` file:
```env
# Switch to OpenAI format
API_FORMAT=openai
OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-4

# Comment out or remove DeepSeek config if not needed
# DEEPSEEK_BASE_URL=http://your-droplet-ip
# DEEPSEEK_TOKEN=your-token-here
```

### Option 3: CLI Switch
```bash
# Switch format and update .env file
node src/cli.js config --format openai
```

## 🔄 Switching Between Formats

You can easily switch between DeepSeek and OpenAI formats:

```bash
# Switch to OpenAI
node src/cli.js config --format openai

# Switch back to DeepSeek
node src/cli.js config --format deepseek
```

## 💻 Code Changes

### No Changes Required

Your existing code continues to work:

```javascript
// This still works exactly the same
const DeepSeekClient = require('./src/index.js');
const client = new DeepSeekClient();

const response = await client.generate('Hello');
console.log(response.response);
```

### New Options Available

You can now explicitly specify API format:

```javascript
// Explicit DeepSeek format
const deepseekClient = new DeepSeekClient({
  apiFormat: 'deepseek',
  baseUrl: 'http://your-droplet-ip',
  token: 'your-token',
  model: 'deepseek-r1:8b'
});

// Or use OpenAI format
const openaiClient = new DeepSeekClient({
  apiFormat: 'openai',
  baseUrl: 'https://api.openai.com',
  token: 'your-openai-key',
  model: 'gpt-4'
});

// Check current format
console.log('Using format:', client.getApiFormat());

// Switch format dynamically
client.setApiFormat('openai');
```

## 🔧 Environment Variables

### Old Format (Still Works)
```env
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here
DEEPSEEK_MODEL=deepseek-r1:8b
```

### New Explicit Format (Recommended)
```env
# Explicit DeepSeek
API_FORMAT=deepseek
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here
DEEPSEEK_MODEL=deepseek-r1:8b

# Or explicit OpenAI
API_FORMAT=openai
OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-4
```

### Variable Priority

The client checks variables in this order:

1. **Constructor config** (highest priority)
2. **API_FORMAT** environment variable
3. **Auto-detection** from available variables
4. **Default to DeepSeek** (backward compatibility)

## 🚨 Troubleshooting Migration

### Issue: "API format not recognized"
**Solution**: Set `API_FORMAT=deepseek` in your `.env` file

### Issue: Connection fails after update
**Solution**: 
```bash
# Check your configuration
node src/cli.js config --show

# Verify environment variables
cat .env
```

### Issue: Wrong API format detected
**Solution**: 
```bash
# Explicitly set format
node src/cli.js config --format deepseek
```

### Issue: Templates not working
**Solution**: Templates work with both formats - no changes needed

## 📊 Feature Compatibility

| Feature | Before | After | Notes |
|---------|--------|-------|-------|
| Basic generation | ✅ | ✅ | No changes |
| Streaming | ✅ | ✅ | Same interface |
| Templates | ✅ | ✅ | Work with both APIs |
| CLI commands | ✅ | ✅ | New config command added |
| Environment vars | ✅ | ✅ | Old variables still work |
| Magento 2 analysis | ✅ | ✅ | Works with both APIs |

## 🆕 New CLI Commands

```bash
# Configuration management
node src/cli.js config                 # Interactive setup
node src/cli.js config --show          # Show current config
node src/cli.js config --format openai # Switch to OpenAI

# Test shows API format now
node src/cli.js test
# Output includes: 🔧 API Format: deepseek
```

## 🔍 Validation

After migration, verify everything works:

```bash
# 1. Test connection
node src/cli.js test

# 2. Try a simple prompt
node src/cli.js ask "Hello, world!"

# 3. Test templates
node src/cli.js template explain-concept

# 4. Check configuration
node src/cli.js config --show
```

Expected output for DeepSeek setup:
```
✅ Connection successful!
📡 Server: http://your-droplet-ip
🤖 Model: deepseek-r1:8b
🔧 API Format: deepseek
```

## 🚀 Benefits of Migration

### Immediate Benefits
- **No work required** - everything continues working
- **Explicit configuration** - clearer setup
- **Better error messages** - more helpful debugging

### Future Benefits
- **Multi-API support** - switch between services
- **OpenAI compatibility** - use official OpenAI API
- **Custom API support** - use any OpenAI-compatible service
- **Better testing** - test with different providers

## 📚 Examples

### Run Migration Examples
```bash
# See migration examples in action
node examples/api-formats-example.js

# Test your specific setup
node examples/basic-usage.js
```

### Configuration Examples
```bash
# DeepSeek (your current setup)
API_FORMAT=deepseek
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here

# OpenAI (new option)
API_FORMAT=openai
OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your-openai-key

# Custom OpenAI-compatible
API_FORMAT=openai
OPENAI_BASE_URL=http://your-custom-server
OPENAI_API_KEY=your-custom-key
```

## 🆘 Support

If you encounter any issues during migration:

1. **Check current configuration**: `node src/cli.js config --show`
2. **Verify backward compatibility**: Your old `.env` should still work
3. **Test connection**: `node src/cli.js test`
4. **Check examples**: `node examples/api-formats-example.js`

### Common Migration Commands

```bash
# Quick migration check
node src/cli.js config --show
node src/cli.js test

# If you want to be explicit about DeepSeek
echo "API_FORMAT=deepseek" >> .env

# If you want to try OpenAI
node src/cli.js config --format openai
```

## ✅ Migration Checklist

- [ ] Update code (pull latest version)
- [ ] Test existing setup: `node src/cli.js test`
- [ ] Add `API_FORMAT=deepseek` to `.env` (optional but recommended)
- [ ] Verify templates work: `node src/cli.js list`
- [ ] Test Magento 2 analysis: `node src/cli.js magento2` (if used)
- [ ] Explore new config command: `node src/cli.js config --show`
- [ ] Consider trying OpenAI format (optional)

## 🎉 Migration Complete!

Your DeepSeek client is now OpenAI-compatible while maintaining full backward compatibility. Everything you were doing before continues to work, and you now have the option to use OpenAI or other compatible APIs.

**Key Points:**
- ✅ No breaking changes
- ✅ Your existing setup works unchanged
- ✅ New capabilities available when you need them
- ✅ Easy switching between API formats
- ✅ Better configuration management

Welcome to the enhanced AI client! 🚀