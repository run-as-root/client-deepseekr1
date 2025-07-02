const AIClient = require("../src/index.js");
require("dotenv").config();

async function basicExamples() {
  try {
    // Initialize the client
    console.log("🤖 Initializing AI Client...");
    const client = new AIClient();

    // Test connection first
    console.log("\n🔍 Testing connection...");
    const isConnected = await client.testConnection();
    if (!isConnected) {
      console.error("❌ Connection failed! Please check your configuration.");
      return;
    }
    console.log("✅ Connection successful!");

    // Example 1: Simple prompt
    console.log("\n📝 Example 1: Simple Prompt");
    console.log("─".repeat(50));
    const simpleResponse = await client.generate("What is DeepSeek-R1?");
    console.log("Response:", simpleResponse.response);

    // Example 2: Using a template with variables
    console.log("\n📝 Example 2: Using Template with Variables");
    console.log("─".repeat(50));
    const templateResponse = await client.generateFromTemplate(
      "explain-concept",
      {
        concept: "machine learning",
        audience: "beginners",
        level: "basic",
        context: "for someone new to programming",
      },
    );
    console.log("Response:", templateResponse.response);

    // Example 3: Streaming response
    console.log("\n📝 Example 3: Streaming Response");
    console.log("─".repeat(50));
    console.log('Streaming response for: "Write a short poem about AI"');
    console.log("Response: ");
    await client.generateStream("Write a short poem about AI", (chunk) => {
      if (chunk.response) {
        process.stdout.write(chunk.response);
      }
    });
    console.log("\n");

    // Example 4: List available templates
    console.log("\n📝 Example 4: Available Templates");
    console.log("─".repeat(50));
    const templates = await client.listPromptTemplates();
    console.log("Available templates:");
    templates.forEach((template, index) => {
      console.log(`  ${index + 1}. ${template}`);
    });

    // Example 5: Code review template
    console.log("\n📝 Example 5: Code Review Template");
    console.log("─".repeat(50));
    const codeToReview = `
function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

    const codeReviewResponse = await client.generateFromTemplate(
      "code-review",
      {
        language: "javascript",
        context: "Shopping cart calculation function",
        code: codeToReview,
      },
    );
    console.log("Code Review Response:", codeReviewResponse.response);

    // Example 6: Creating and using a custom template
    console.log("\n📝 Example 6: Creating Custom Template");
    console.log("─".repeat(50));

    const customTemplate = `You are a helpful writing assistant.

Please help me write a {{type}} about {{topic}}.

Style: {{style}}
Length: {{length}}
Audience: {{audience}}

Additional requirements:
{{requirements}}

Please make it engaging and well-structured.`;

    await client.savePromptTemplate("custom-writing", customTemplate);
    console.log("✅ Custom template saved!");

    const customResponse = await client.generateFromTemplate("custom-writing", {
      type: "blog post introduction",
      topic: "the future of artificial intelligence",
      style: "professional but accessible",
      length: "about 150 words",
      audience: "tech enthusiasts",
      requirements: "Include a compelling hook and preview the main points",
    });
    console.log("Custom Template Response:", customResponse.response);

    console.log("\n🎉 All examples completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);

    // Provide helpful debugging information
    if (error.message.includes("Base URL is required")) {
      console.log(
        "\n💡 Tip: Make sure to set DEEPSEEK_BASE_URL in your .env file",
      );
    } else if (error.message.includes("Authorization token is required")) {
      console.log(
        "\n💡 Tip: Make sure to set DEEPSEEK_TOKEN in your .env file",
      );
    } else if (error.message.includes("Network Error")) {
      console.log("\n💡 Tip: Check if your server is running and accessible");
    }
  }
}

// Advanced usage examples
async function advancedExamples() {
  try {
    console.log("\n🚀 Advanced Usage Examples");
    console.log("═".repeat(50));

    const client = new AIClient();

    // Example 1: Multiple model comparison (if you have multiple models)
    console.log("\n🔍 Example: Model Comparison");
    const prompt = "Explain quantum computing in one sentence.";

    const response1 = await client.generate(prompt, {
      model: "deepseek-r1:8b",
    });
    console.log("Model deepseek-r1:8b:", response1.response);

    // Example 2: Template variable extraction
    console.log("\n🔍 Example: Template Variable Detection");
    const template = await client.loadPromptTemplate("brainstorm");
    const variables = [
      ...new Set(
        (template.match(/\{\{(\w+)\}\}/g) || []).map((match) =>
          match.slice(2, -2),
        ),
      ),
    ];
    console.log("Variables in brainstorm template:", variables);

    // Example 3: Batch processing
    console.log("\n🔍 Example: Batch Processing");
    const prompts = [
      "What is AI?",
      "What is machine learning?",
      "What is deep learning?",
    ];

    const batchResponses = await Promise.all(
      prompts.map((prompt) => client.generate(prompt)),
    );

    batchResponses.forEach((response, index) => {
      console.log(`\nQ: ${prompts[index]}`);
      console.log(`A: ${response.response.substring(0, 100)}...`);
    });

    // Example 4: Error handling and retries
    console.log("\n🔍 Example: Error Handling");
    try {
      await client.generate(""); // This should fail
    } catch (error) {
      console.log("Caught expected error:", error.message);
    }

    // Example 5: Performance monitoring
    console.log("\n🔍 Example: Performance Monitoring");
    const startTime = Date.now();
    const perfResponse = await client.generate("Count from 1 to 10");
    const endTime = Date.now();

    console.log(`Response time: ${endTime - startTime}ms`);
    if (perfResponse.total_duration) {
      console.log(
        `Server processing time: ${Math.round(perfResponse.total_duration / 1000000)}ms`,
      );
    }
  } catch (error) {
    console.error("❌ Advanced examples error:", error.message);
  }
}

// Run examples
async function runAllExamples() {
  console.log("🎯 AI Client Examples");
  console.log("═".repeat(50));

  await basicExamples();
  await advancedExamples();

  console.log("\n✨ All examples completed!");
  console.log("\n📚 Next steps:");
  console.log("   1. Try the interactive CLI: npm start");
  console.log("   2. Create your own templates in the prompts/ folder");
  console.log("   3. Integrate the client into your applications");
  console.log("   4. Explore streaming responses for real-time interactions");
}

// Only run if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  basicExamples,
  advancedExamples,
  runAllExamples,
};
