const AIClient = require("../src/index.js");
require("dotenv").config();

async function demonstrateApiFormats() {
  console.log("🔄 API Format Compatibility Examples");
  console.log("═".repeat(60));

  try {
    // Example 1: DeepSeek Format (Default/Backward Compatible)
    console.log("\n📝 Example 1: DeepSeek API Format");
    console.log("─".repeat(40));

    const deepSeekClient = new AIClient({
      apiFormat: "deepseek",
      baseUrl: process.env.DEEPSEEK_BASE_URL || "http://your-droplet-ip",
      token: process.env.DEEPSEEK_TOKEN || "your-deepseek-token",
      model: "deepseek-r1:8b",
    });

    console.log(`Format: ${deepSeekClient.getApiFormat()}`);
    console.log("Making request to DeepSeek API...");

    try {
      const deepSeekResponse = await deepSeekClient.generate(
        "What is the capital of France?",
      );
      console.log(
        "✅ DeepSeek Response:",
        deepSeekResponse.response?.substring(0, 100) + "...",
      );
    } catch (error) {
      console.log("❌ DeepSeek Error:", error.message);
    }

    // Example 2: OpenAI Format
    console.log("\n📝 Example 2: OpenAI API Format");
    console.log("─".repeat(40));

    const openaiClient = new AIClient({
      apiFormat: "openai",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com",
      token: process.env.OPENAI_API_KEY || "your-openai-key",
      model: "gpt-4",
    });

    console.log(`Format: ${openaiClient.getApiFormat()}`);
    console.log("Making request to OpenAI API...");

    try {
      const openaiResponse = await openaiClient.generate(
        "What is the capital of France?",
      );
      console.log(
        "✅ OpenAI Response:",
        openaiResponse.response?.substring(0, 100) + "...",
      );
    } catch (error) {
      console.log("❌ OpenAI Error:", error.message);
    }

    // Example 3: Auto-Detection Based on Environment
    console.log("\n📝 Example 3: Auto-Detection from Environment");
    console.log("─".repeat(40));

    const autoClient = new AIClient();
    console.log(`Auto-detected format: ${autoClient.getApiFormat()}`);

    // Example 4: Switching API Formats
    console.log("\n📝 Example 4: Dynamic API Format Switching");
    console.log("─".repeat(40));

    const switchableClient = new AIClient({
      baseUrl: process.env.DEEPSEEK_BASE_URL || "http://localhost:8080",
      token: process.env.DEEPSEEK_TOKEN || "test-token",
      model: "deepseek-r1:8b",
    });

    console.log(`Initial format: ${switchableClient.getApiFormat()}`);

    // Switch to OpenAI format
    switchableClient.setApiFormat("openai");
    console.log(`After switch: ${switchableClient.getApiFormat()}`);

    // Switch back to DeepSeek
    switchableClient.setApiFormat("deepseek");
    console.log(`Back to: ${switchableClient.getApiFormat()}`);

    // Example 5: Using Templates with Different Formats
    console.log("\n📝 Example 5: Templates with Different API Formats");
    console.log("─".repeat(40));

    const templateClient = new AIClient();

    try {
      const templateResponse = await templateClient.generateFromTemplate(
        "explain-concept",
        {
          concept: "API compatibility",
          audience: "developers",
          level: "intermediate",
          context: "software integration",
        },
      );

      console.log(
        "✅ Template Response Format:",
        templateClient.getApiFormat(),
      );
      console.log(
        "Response preview:",
        templateResponse.response?.substring(0, 150) + "...",
      );
    } catch (error) {
      console.log("❌ Template Error:", error.message);
    }

    // Example 6: Streaming with Different Formats
    console.log("\n📝 Example 6: Streaming Responses");
    console.log("─".repeat(40));

    const streamClient = new AIClient();
    console.log(`Streaming with ${streamClient.getApiFormat()} format...`);

    try {
      let fullResponse = "";
      console.log("Stream output: ");

      await streamClient.generateStream("Count from 1 to 5", (chunk) => {
        if (chunk.response) {
          process.stdout.write(chunk.response);
          fullResponse += chunk.response;
        }
      });

      console.log("\n✅ Streaming completed successfully");
    } catch (error) {
      console.log("\n❌ Streaming Error:", error.message);
    }

    // Example 7: Error Handling Differences
    console.log("\n📝 Example 7: Error Handling");
    console.log("─".repeat(40));

    const errorClient = new AIClient();

    try {
      // This should fail with an empty prompt
      await errorClient.generate("");
    } catch (error) {
      console.log(`Error handling for ${errorClient.getApiFormat()} format:`);
      console.log(`Error type: ${error.constructor.name}`);
      console.log(`Error message: ${error.message}`);
    }

    console.log("\n🎉 All API format examples completed!");
  } catch (error) {
    console.error("❌ Example error:", error.message);
  }
}

// Configuration examples for different scenarios
async function showConfigurationExamples() {
  console.log("\n🛠️  Configuration Examples");
  console.log("═".repeat(60));

  const examples = {
    deepseek: {
      name: "DeepSeek (Self-hosted)",
      config: {
        apiFormat: "deepseek",
        baseUrl: "http://your-droplet-ip",
        token: "your-deepseek-token",
        model: "deepseek-r1:8b",
        timeout: 30000,
      },
      env: `# DeepSeek Configuration
API_FORMAT=deepseek
DEEPSEEK_BASE_URL=http://your-droplet-ip
DEEPSEEK_TOKEN=your-token-here
DEEPSEEK_MODEL=deepseek-r1:8b
DEEPSEEK_TIMEOUT=30000`,
    },
    openai: {
      name: "OpenAI Official API",
      config: {
        apiFormat: "openai",
        baseUrl: "https://api.openai.com",
        token: "your-openai-key",
        model: "gpt-4",
        timeout: 30000,
      },
      env: `# OpenAI Configuration
API_FORMAT=openai
OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your-openai-key-here
OPENAI_MODEL=gpt-4
DEEPSEEK_TIMEOUT=30000`,
    },
    customOpenai: {
      name: "Custom OpenAI-Compatible",
      config: {
        apiFormat: "openai",
        baseUrl: "http://your-custom-server",
        token: "your-custom-key",
        model: "custom-model",
        timeout: 30000,
      },
      env: `# Custom OpenAI-Compatible API
API_FORMAT=openai
OPENAI_BASE_URL=http://your-custom-server
OPENAI_API_KEY=your-custom-key
OPENAI_MODEL=custom-model
DEEPSEEK_TIMEOUT=30000`,
    },
  };

  for (const [key, example] of Object.entries(examples)) {
    console.log(`\n📋 ${example.name}`);
    console.log("─".repeat(30));

    console.log("JavaScript Configuration:");
    console.log("```javascript");
    console.log(
      `const client = new AIClient(${JSON.stringify(example.config, null, 2)});`,
    );
    console.log("```");

    console.log("\nEnvironment Variables:");
    console.log("```env");
    console.log(example.env);
    console.log("```");
  }
}

// Compatibility testing
async function testCompatibility() {
  console.log("\n🧪 Compatibility Testing");
  console.log("═".repeat(60));

  const testPrompt = "Hello, world!";
  const formats = ["deepseek", "openai"];

  for (const format of formats) {
    console.log(`\n🔍 Testing ${format.toUpperCase()} format...`);

    try {
      const client = new AIClient({
        apiFormat: format,
        baseUrl:
          format === "openai"
            ? "https://api.openai.com"
            : "http://localhost:8080",
        token: "test-token",
        model: format === "openai" ? "gpt-4" : "deepseek-r1:8b",
      });

      console.log(`✅ Client initialized with ${client.getApiFormat()} format`);
      console.log(`📡 Base URL: ${client.baseUrl}`);
      console.log(`🤖 Model: ${client.model}`);

      // Test request formatting (without actually making the request)
      const requestData = client._formatRequest(testPrompt, {});
      console.log("📤 Request format:", JSON.stringify(requestData, null, 2));
    } catch (error) {
      console.log(`❌ Error testing ${format}:`, error.message);
    }
  }
}

// Performance comparison (mock)
async function performanceComparison() {
  console.log("\n⚡ Performance Considerations");
  console.log("═".repeat(60));

  console.log("\n📊 Request Format Comparison:");
  console.log("─".repeat(40));

  const prompt = "Explain quantum computing";

  // DeepSeek format
  console.log("DeepSeek Request Format:");
  console.log(
    JSON.stringify(
      {
        model: "deepseek-r1:8b",
        prompt: prompt,
        stream: false,
      },
      null,
      2,
    ),
  );

  // OpenAI format
  console.log("\nOpenAI Request Format:");
  console.log(
    JSON.stringify(
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      },
      null,
      2,
    ),
  );

  console.log("\n📈 Key Differences:");
  console.log('• DeepSeek uses simple "prompt" field');
  console.log('• OpenAI uses "messages" array with roles');
  console.log("• Response formats vary between APIs");
  console.log("• Streaming formats are different");
  console.log("• Error handling varies");
}

// Migration guide
async function migrationGuide() {
  console.log("\n🔄 Migration Guide");
  console.log("═".repeat(60));

  console.log("\n📝 Migrating from DeepSeek-only to Multi-API:");
  console.log("─".repeat(50));

  console.log("1. Update your .env file:");
  console.log("   • Add API_FORMAT=deepseek for current setup");
  console.log("   • Keep existing DEEPSEEK_* variables");

  console.log("\n2. No code changes needed:");
  console.log("   • Existing code continues to work");
  console.log("   • Default behavior is unchanged");

  console.log("\n3. To use OpenAI:");
  console.log("   • Set API_FORMAT=openai");
  console.log("   • Add OPENAI_BASE_URL and OPENAI_API_KEY");
  console.log("   • Update model names as needed");

  console.log("\n📝 Environment Variable Priority:");
  console.log("─".repeat(40));
  console.log("• API_FORMAT → apiFormat config");
  console.log("• DEEPSEEK_BASE_URL → OPENAI_BASE_URL");
  console.log("• DEEPSEEK_TOKEN → OPENAI_API_KEY");
  console.log("• DEEPSEEK_MODEL → OPENAI_MODEL");

  console.log("\n🔧 CLI Usage:");
  console.log("─".repeat(20));
  console.log("• node src/cli.js config --show");
  console.log("• node src/cli.js config --format openai");
  console.log("• node src/cli.js config (interactive setup)");
}

// Main execution
async function runAllExamples() {
  console.log("🚀 AI Client API Format Compatibility Demo");
  console.log("═".repeat(70));

  console.log("\nThis demo shows how the client supports both:");
  console.log("• DeepSeek API format");
  console.log("• OpenAI API format");

  await demonstrateApiFormats();
  await showConfigurationExamples();
  await testCompatibility();
  await performanceComparison();
  await migrationGuide();

  console.log("\n✨ Demo completed!");
  console.log("\n📚 Next Steps:");
  console.log("• Configure your preferred API format");
  console.log("• Test with: node src/cli.js test");
  console.log("• Try interactive mode: node src/cli.js interactive");
  console.log("• Manage config: node src/cli.js config");
}

// Export functions for use in other scripts
module.exports = {
  demonstrateApiFormats,
  showConfigurationExamples,
  testCompatibility,
  performanceComparison,
  migrationGuide,
  runAllExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
