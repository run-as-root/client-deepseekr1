const AIClient = require("../src/index.js");
require("dotenv").config();

async function analyzeMagento2Tickets() {
  try {
    console.log("🔍 Magento 2 Ticket Analysis Examples");
    console.log("═".repeat(50));

    const client = new AIClient();

    // Example 1: Feature Request Ticket (incomplete)
    console.log("\n📝 Example 1: Feature Request Analysis");
    console.log("─".repeat(40));

    const featureTicket = `
    Title: Add wishlist feature to product page

    Description: Customers should be able to add products to wishlist from product page.
    The button should be next to add to cart button.
    `;

    const featureAnalysis = await client.generateFromTemplate(
      "magento2-ticket-analysis",
      {
        ticket_content: featureTicket,
        ticket_type: "Feature Request",
        project_context: "E-commerce store with custom theme",
        magento_version: "2.4.6",
        store_config: "Multi-store setup with 3 store views",
        existing_customizations: "Custom checkout, custom product page layout",
        third_party_extensions: "Amasty extensions for SEO and catalog",
        performance_requirements: "Page load time must stay under 3 seconds",
      },
    );

    console.log("Analysis Result:");
    console.log(featureAnalysis.response);

    // Example 2: Bug Fix Ticket (well-defined)
    console.log("\n\n📝 Example 2: Bug Fix Analysis");
    console.log("─".repeat(40));

    const bugTicket = `
    Title: Shopping cart not updating quantity on AJAX request

    Description: When customer changes quantity in shopping cart using +/- buttons,
    the page shows loading spinner but quantity doesn't update.

    Steps to reproduce:
    1. Add product to cart
    2. Go to cart page
    3. Click + button next to quantity
    4. Page shows spinner
    5. Quantity remains the same

    Expected: Quantity should increase by 1
    Actual: Quantity stays the same, no error message

    Environment: Magento 2.4.5, PHP 8.1, custom theme based on Luma
    Browser: Chrome 118, Firefox 119
    `;

    const bugAnalysis = await client.generateFromTemplate(
      "magento2-ticket-analysis",
      {
        ticket_content: bugTicket,
        ticket_type: "Bug Fix",
        project_context: "Fashion e-commerce store",
        magento_version: "2.4.5",
        store_config: "Single store, English language",
        existing_customizations: "Custom cart page design, AJAX improvements",
        third_party_extensions: "None affecting cart functionality",
        performance_requirements: "Standard performance requirements",
      },
    );

    console.log("Analysis Result:");
    console.log(bugAnalysis.response);

    // Example 3: Tech Maintenance Ticket
    console.log("\n\n📝 Example 3: Tech Maintenance Analysis");
    console.log("─".repeat(40));

    const maintenanceTicket = `
    Title: Upgrade jQuery library from 3.5.1 to 3.7.1

    Description: Current jQuery version has security vulnerabilities.
    Need to upgrade to latest stable version and test all frontend functionality.

    Current state: jQuery 3.5.1 loaded in head section
    Desired state: jQuery 3.7.1 with same functionality

    Reason: Security patch for CVE-2023-XXXX
    `;

    const maintenanceAnalysis = await client.generateFromTemplate(
      "magento2-ticket-analysis",
      {
        ticket_content: maintenanceTicket,
        ticket_type: "Tech Maintenance",
        project_context: "Corporate B2B store",
        magento_version: "2.4.6",
        store_config: "Multi-website B2B setup",
        existing_customizations: "Heavy jQuery usage in custom modules",
        third_party_extensions: "Several extensions using jQuery",
        performance_requirements: "Critical - minimal downtime allowed",
      },
    );

    console.log("Analysis Result:");
    console.log(maintenanceAnalysis.response);

    // Example 4: Unclear/Vague Ticket
    console.log("\n\n📝 Example 4: Vague Ticket Analysis");
    console.log("─".repeat(40));

    const vagueTicket = `
    Title: Fix the search

    Description: Search is broken. Customers can't find products.
    Please fix ASAP.
    `;

    const vagueAnalysis = await client.generateFromTemplate(
      "magento2-ticket-analysis",
      {
        ticket_content: vagueTicket,
        ticket_type: "Unknown",
        project_context: "General e-commerce store",
        magento_version: "2.4.x",
        store_config: "Unknown",
        existing_customizations: "Unknown",
        third_party_extensions: "Unknown",
        performance_requirements: "Unknown",
      },
    );

    console.log("Analysis Result:");
    console.log(vagueAnalysis.response);

    console.log("\n🎉 All Magento 2 ticket analyses completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Helper function for interactive ticket analysis
async function interactiveTicketAnalysis() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }

  try {
    console.log("\n🎯 Interactive Magento 2 Ticket Analysis");
    console.log("═".repeat(50));

    const ticketContent = await question("Paste your ticket content: ");
    const ticketType = await question(
      "Ticket type (Feature Request/Bug Fix/Tech Maintenance/Unknown): ",
    );
    const magentoVersion = await question("Magento version (e.g., 2.4.6): ");
    const projectContext = await question("Project context (optional): ");

    console.log("\n🔍 Analyzing ticket...");

    const client = new AIClient();
    const analysis = await client.generateFromTemplate(
      "magento2-ticket-analysis",
      {
        ticket_content: ticketContent,
        ticket_type: ticketType,
        project_context: projectContext || "General Magento 2 project",
        magento_version: magentoVersion,
        store_config: "Standard configuration",
        existing_customizations: "Standard customizations",
        third_party_extensions: "Standard extensions",
        performance_requirements: "Standard performance requirements",
      },
    );

    console.log("\n📋 Analysis Result:");
    console.log("═".repeat(50));
    console.log(analysis.response);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

// Real-world ticket examples for testing
const realWorldExamples = {
  featureRequest: `
    Title: Implement Product Comparison Feature

    As a customer, I want to compare multiple products side by side
    so that I can make informed purchasing decisions.

    Requirements:
    - Compare up to 4 products at once
    - Show product attributes in table format
    - Add "Compare" button on category and product pages
    - Persist comparison across sessions

    Acceptance Criteria:
    - Customer can add products to comparison from listing pages
    - Customer can view comparison table with key attributes
    - Customer can remove products from comparison
    - Comparison data persists in customer session
  `,

  bugFix: `
    Title: Newsletter subscription not working on checkout

    Context: Magento 2.4.5 with custom checkout

    Steps to reproduce:
    1. Add product to cart
    2. Go to checkout
    3. Fill shipping information
    4. Check "Subscribe to newsletter" checkbox
    5. Complete order
    6. Check admin > Customers > Newsletter Subscribers

    Expected: Customer appears in newsletter subscribers list
    Actual: Customer is not subscribed to newsletter

    Additional info:
    - Default Magento newsletter subscription works fine
    - Only checkout subscription is broken
    - No errors in logs
    - Checkbox appears checked after form submission
  `,

  techMaintenance: `
    Title: Remove deprecated layout XML syntax

    Current State: Using deprecated layout XML syntax in several custom modules
    Desired State: Updated to current Magento 2.4.x layout standards

    Reason: Deprecated syntax will be removed in Magento 2.5.x

    Affected files:
    - app/code/Custom/Module1/view/frontend/layout/*.xml
    - app/code/Custom/Module2/view/adminhtml/layout/*.xml

    Requirements:
    - Update all deprecated <action> tags to <argument> syntax
    - Test all affected pages for layout issues
    - Ensure backward compatibility with current theme
  `,
};

// Export functions for use in other scripts
module.exports = {
  analyzeMagento2Tickets,
  interactiveTicketAnalysis,
  realWorldExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--interactive")) {
    interactiveTicketAnalysis().catch(console.error);
  } else {
    analyzeMagento2Tickets().catch(console.error);
  }
}
