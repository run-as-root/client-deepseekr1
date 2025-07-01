# Magento 2 Developer Guide - DeepSeek Client

A specialized guide for Magento 2 developers using the DeepSeek client to analyze and clarify project tickets.

## Overview

This client includes specialized templates and commands designed specifically for Magento 2 development workflows. Whether you're dealing with feature requests, bug fixes, or technical maintenance tasks, these tools help ensure you have all the information needed for successful implementation.

## Quick Start for Magento 2 Developers

### Installation
```bash
cd client-for-digitalocean-deepseekr1
npm run setup
```

### First Ticket Analysis
```bash
# Interactive analysis
node src/cli.js magento2

# Quick analysis
node src/cli.js magento2 --quick

# From file
node src/cli.js magento2 --file my-ticket.txt
```

## Magento 2 Templates

### 1. Comprehensive Ticket Analysis (`magento2-ticket-analysis`)

**Purpose**: Deep analysis of tickets with complete technical assessment

**When to use**:
- Complex features or integrations
- Unclear requirements
- High-risk implementations
- New team members need detailed guidance

**Variables**:
- `ticket_content` - The full ticket description
- `ticket_type` - Feature Request/Bug Fix/Tech Maintenance  
- `project_context` - Project background
- `magento_version` - Magento version (e.g., 2.4.6)
- `store_config` - Store setup details
- `existing_customizations` - Current customizations
- `third_party_extensions` - Installed extensions
- `performance_requirements` - Performance criteria

**Example**:
```bash
node src/cli.js template magento2-ticket-analysis --vars '{
  "ticket_content": "Add wishlist sharing via email",
  "ticket_type": "Feature Request", 
  "project_context": "B2B fashion store",
  "magento_version": "2.4.6",
  "store_config": "Multi-website setup",
  "existing_customizations": "Custom customer account pages",
  "third_party_extensions": "Amasty Customer Attributes",
  "performance_requirements": "Page load under 2 seconds"
}'
```

### 2. Quick Clarification (`magento2-quick-clarify`)

**Purpose**: Fast assessment for simpler tickets or initial triage

**When to use**:
- Simple bug fixes
- Quick feature additions
- Initial ticket review
- Time-constrained situations

**Variables**:
- `ticket_content` - The ticket description
- `magento_version` - Magento version
- `project_type` - Type of project (B2B, B2C, etc.)

**Example**:
```bash
node src/cli.js template magento2-quick-clarify --vars '{
  "ticket_content": "Product images not showing in cart",
  "magento_version": "2.4.5",
  "project_type": "E-commerce store"
}'
```

## Ticket Types & Requirements

### Feature Requests

**Must Have**:
- User story (who, what, why)
- Functional requirements
- Affected Magento areas
- UI/UX specifications
- Test scenarios

**Example Well-Defined Feature Request**:
```
Title: Customer Product Reviews with Photos

User Story:
As a customer, I want to upload photos with my product reviews
so that other customers can see real usage examples.

Requirements:
- Upload up to 3 images per review
- Image validation (size, format)
- Display images in review listings
- Admin moderation capabilities
- Mobile-responsive image gallery

Affected Areas:
- Review module (frontend/backend)
- Media management
- Admin review management
- Product page display

Test Scenarios:
- Upload valid images
- Upload invalid formats
- Review display with/without images
- Admin approval workflow
```

### Bug Fixes

**Must Have**:
- Context/Pre-conditions
- Steps to reproduce
- Expected vs actual results
- Environment details
- Error messages/logs

**Example Well-Defined Bug Report**:
```
Title: AJAX Add to Cart Fails with Configurable Products

Context:
- Magento 2.4.6 with custom theme
- Varnish cache enabled
- Redis for session storage

Steps to Reproduce:
1. Navigate to configurable product page
2. Select color: Red, size: Large
3. Click "Add to Cart" button
4. Observe AJAX spinner shows
5. Check browser network tab

Expected Result:
- Product added to cart
- Success message displayed
- Cart counter updates

Actual Result:
- AJAX call returns 500 error
- No success message
- Cart remains empty
- Console shows: "Uncaught TypeError: Cannot read property 'html' of null"

Environment:
- Browser: Chrome 119, Firefox 118
- PHP: 8.1.25
- MySQL: 8.0.34
```

### Tech Maintenance

**Must Have**:
- Current state description
- Desired end state
- Justification for change
- Risk assessment
- Dependencies

**Example Well-Defined Maintenance Task**:
```
Title: Upgrade Elasticsearch from 7.17 to 8.8

Current State:
- Elasticsearch 7.17.9 running on separate server
- Custom search modifications in place
- ~50k products indexed

Desired State:
- Elasticsearch 8.8.x with improved performance
- Maintain all current search functionality
- Zero data loss during migration

Justification:
- Security patches for ES 7.x ending
- Performance improvements in ES 8.x
- Compatibility with planned Magento 2.4.7 upgrade

Dependencies:
- Magento_Elasticsearch8 module
- Custom search modules compatibility
- Server infrastructure updates
```

## Common Magento 2 Scenarios

### E-commerce Features

```javascript
// Product comparison feature
const comparison = await client.generateFromTemplate('magento2-ticket-analysis', {
  ticket_content: `
    Add product comparison functionality:
    - Compare up to 4 products
    - Side-by-side attribute comparison
    - Add/remove from comparison on listing pages
    - Persist comparison across sessions
  `,
  ticket_type: 'Feature Request',
  magento_version: '2.4.6',
  project_context: 'Electronics store with complex products'
});
```

### Performance Issues

```javascript
// Page load optimization
const performance = await client.generateFromTemplate('magento2-quick-clarify', {
  ticket_content: `
    Category pages loading slowly (5+ seconds)
    - 200+ products per page
    - Multiple product images
    - Customer complaining about speed
  `,
  magento_version: '2.4.5',
  project_type: 'High-traffic B2C store'
});
```

### Integration Problems

```javascript
// Payment gateway issues
const integration = await client.generateFromTemplate('magento2-ticket-analysis', {
  ticket_content: `
    PayPal Express checkout failing intermittently
    - Works in staging environment
    - Fails ~30% of time in production
    - No clear error pattern
    - Customer support tickets increasing
  `,
  ticket_type: 'Bug Fix',
  magento_version: '2.4.6',
  existing_customizations: 'Custom checkout flow with multi-step process'
});
```

### Admin Panel Customizations

```javascript
// Admin enhancement
const adminFeature = await client.generateFromTemplate('magento2-ticket-analysis', {
  ticket_content: `
    Add bulk product status update in admin grid
    - Select multiple products
    - Change status (enabled/disabled) in bulk
    - Show confirmation dialog
    - Log changes for audit trail
  `,
  ticket_type: 'Feature Request',
  project_context: 'Admin managing 10k+ products daily'
});
```

## Best Practices

### 1. Information Gathering

Before using the templates, gather:
- Complete ticket description
- Magento version and patches
- Theme information (custom/third-party)
- Extension list
- Environment details (staging/production)
- Previous related issues

### 2. Template Selection

**Use comprehensive analysis when**:
- Requirements are unclear
- Multiple Magento areas affected
- High business impact
- Complex integrations involved
- New team members working on ticket

**Use quick clarification when**:
- Simple, well-defined tasks
- Familiar functionality areas
- Time constraints
- Initial ticket triage

### 3. Follow-up Questions

Common areas needing clarification:

**For Features**:
- User permissions and roles
- Mobile responsiveness requirements
- Multi-store/multi-website behavior
- SEO considerations
- Performance impact

**For Bugs**:
- Reproduction steps in clean environment
- Data migration considerations
- Third-party extension conflicts
- Browser/device specific issues

**For Maintenance**:
- Deployment strategy
- Rollback procedures
- Testing requirements
- Communication to stakeholders

## Integration with Development Workflow

### 1. Ticket Intake Process

```bash
# Step 1: Initial analysis
node src/cli.js magento2 --quick

# Step 2: If more detail needed
node src/cli.js magento2

# Step 3: Create formatted ticket or question list
```

### 2. Development Planning

```javascript
// Use analysis results for:
// - Story point estimation
// - Technical approach planning
// - Risk assessment
// - Resource allocation

const analysis = await client.generateFromTemplate('magento2-ticket-analysis', {
  // ... ticket details
});

// Extract estimated effort and complexity from response
```

### 3. Documentation

```bash
# Generate analysis for:
# - Technical specification documents
# - Code review checklists
# - Testing procedures
# - Deployment notes
```

## Troubleshooting

### Common Issues

**Template not found**:
```bash
# Verify templates exist
node src/cli.js list | grep magento2
```

**Variable substitution errors**:
- Check JSON syntax in --vars parameter
- Ensure all required variables provided
- Use quotes around variable values

**Analysis too generic**:
- Provide more specific ticket content
- Include technical details
- Add context about existing customizations

### Getting Better Results

**Be specific in ticket content**:
```
❌ "Fix the checkout"
✅ "AJAX validation fails on checkout step 2 when customer has multiple addresses"
```

**Include environment details**:
```
❌ "Latest Magento"
✅ "Magento 2.4.6-p3, PHP 8.1, custom Luma-based theme, Amasty OneStepCheckout"
```

**Describe expected behavior**:
```
❌ "Should work properly"
✅ "Should validate address fields in real-time without page refresh"
```

## Advanced Usage

### Batch Processing

```javascript
// Analyze multiple tickets from a backlog
const tickets = [
  { content: "Add product video support", type: "Feature Request" },
  { content: "Fix mobile menu styling", type: "Bug Fix" },
  { content: "Upgrade Redis to version 7", type: "Tech Maintenance" }
];

for (const ticket of tickets) {
  const analysis = await client.generateFromTemplate('magento2-quick-clarify', {
    ticket_content: ticket.content,
    magento_version: '2.4.6',
    project_type: 'E-commerce store'
  });
  
  console.log(`\n--- ${ticket.content} ---`);
  console.log(analysis.response);
}
```

### Custom Templates

Create specialized templates for your team:

```bash
# Create team-specific template
echo "Analyze this {{ticket_type}} for our {{project_name}} Magento store..." > prompts/team-magento-analysis.txt

# Use with team context
node src/cli.js template team-magento-analysis --vars '{
  "ticket_type": "feature",
  "project_name": "FashionStore"
}'
```

## Support and Resources

### Getting Help

1. **Check template variables**: Ensure all required variables are provided
2. **Review examples**: Look at working examples in this guide
3. **Test connection**: Run `node src/cli.js test` to verify setup
4. **Check logs**: Look for error messages in console output

### Additional Resources

- [Magento 2 Developer Documentation](https://developer.adobe.com/commerce/docs/)
- [Magento 2 Technical Guidelines](https://developer.adobe.com/commerce/php/development/)
- [Best Practices for Magento 2](https://experienceleague.adobe.com/docs/commerce-operations/implementation-playbook/best-practices/development/overview.html)

---

**Happy coding with Magento 2 and DeepSeek! 🚀**