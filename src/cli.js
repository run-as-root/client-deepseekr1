#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const DeepSeekClient = require('./DeepSeekClient');
require('dotenv').config();

// Initialize the client
let client;

try {
  client = new DeepSeekClient();
} catch (error) {
  console.error(chalk.red('❌ Error initializing DeepSeek client:'));
  console.error(chalk.red(error.message));
  console.log(chalk.yellow('\n💡 Make sure to set your environment variables:'));
  console.log(chalk.cyan('   DEEPSEEK_BASE_URL=http://your-droplet-ip'));
  console.log(chalk.cyan('   DEEPSEEK_TOKEN=your-token-here'));
  console.log(chalk.yellow('\nOr create a .env file with these values.'));
  process.exit(1);
}

// Helper function to format response
function formatResponse(response) {
  console.log(chalk.green('\n📝 Response:'));
  console.log(chalk.white('─'.repeat(50)));

  if (response.response) {
    console.log(response.response);
  } else if (response.text) {
    console.log(response.text);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }

  console.log(chalk.white('─'.repeat(50)));

  if (response.total_duration) {
    console.log(chalk.gray(`⏱️  Duration: ${Math.round(response.total_duration / 1000000)}ms`));
  }
}

// Helper function to handle errors
function handleError(error) {
  console.error(chalk.red('\n❌ Error:'), error.message);
}

// Command: Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    console.log(chalk.blue('🤖 Welcome to DeepSeek Interactive Mode!'));
    console.log(chalk.gray('Type "exit" to quit, "templates" to see available templates\n'));

    while (true) {
      try {
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: '💬 Send a prompt', value: 'prompt' },
              { name: '📝 Use a template', value: 'template' },
              { name: '📋 List templates', value: 'list' },
              { name: '➕ Create new template', value: 'create' },
              { name: '🔍 Test connection', value: 'test' },
              { name: '🚪 Exit', value: 'exit' }
            ]
          }
        ]);

        if (action === 'exit') {
          console.log(chalk.green('👋 Goodbye!'));
          break;
        }

        if (action === 'prompt') {
          const { prompt } = await inquirer.prompt([
            {
              type: 'input',
              name: 'prompt',
              message: 'Enter your prompt:',
              validate: (input) => input.trim() !== '' || 'Prompt cannot be empty'
            }
          ]);

          const spinner = ora('Thinking...').start();
          try {
            const response = await client.generate(prompt);
            spinner.stop();
            formatResponse(response);
          } catch (error) {
            spinner.stop();
            handleError(error);
          }
        }

        if (action === 'template') {
          const templates = await client.listPromptTemplates();
          if (templates.length === 0) {
            console.log(chalk.yellow('📭 No templates found. Create one first!'));
            continue;
          }

          const { templateName } = await inquirer.prompt([
            {
              type: 'list',
              name: 'templateName',
              message: 'Choose a template:',
              choices: templates
            }
          ]);

          const template = await client.loadPromptTemplate(templateName);

          // Extract variables from template
          const variableMatches = template.match(/\{\{(\w+)\}\}/g) || [];
          const variables = [...new Set(variableMatches.map(match => match.slice(2, -2)))];

          const templateVars = {};
          if (variables.length > 0) {
            console.log(chalk.blue(`\n📝 Template requires variables: ${variables.join(', ')}`));
            for (const variable of variables) {
              const { value } = await inquirer.prompt([
                {
                  type: 'input',
                  name: 'value',
                  message: `Enter value for {{${variable}}}:`
                }
              ]);
              templateVars[variable] = value;
            }
          }

          const finalPrompt = client.replaceTemplateVariables(template, templateVars);
          console.log(chalk.gray('\n📋 Generated prompt:'));
          console.log(chalk.white(finalPrompt));

          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Send this prompt?',
              default: true
            }
          ]);

          if (confirm) {
            const spinner = ora('Thinking...').start();
            try {
              const response = await client.generate(finalPrompt);
              spinner.stop();
              formatResponse(response);
            } catch (error) {
              spinner.stop();
              handleError(error);
            }
          }
        }

        if (action === 'list') {
          const templates = await client.listPromptTemplates();
          if (templates.length === 0) {
            console.log(chalk.yellow('📭 No templates found.'));
          } else {
            console.log(chalk.blue('\n📝 Available templates:'));
            templates.forEach((template, index) => {
              console.log(chalk.cyan(`  ${index + 1}. ${template}`));
            });
          }
        }

        if (action === 'create') {
          const { templateName, content } = await inquirer.prompt([
            {
              type: 'input',
              name: 'templateName',
              message: 'Template name:',
              validate: (input) => input.trim() !== '' || 'Template name cannot be empty'
            },
            {
              type: 'editor',
              name: 'content',
              message: 'Template content (use {{variable}} for placeholders):',
              validate: (input) => input.trim() !== '' || 'Template content cannot be empty'
            }
          ]);

          try {
            await client.savePromptTemplate(templateName, content);
            console.log(chalk.green(`✅ Template '${templateName}' saved successfully!`));
          } catch (error) {
            handleError(error);
          }
        }

        if (action === 'test') {
          const spinner = ora('Testing connection...').start();
          try {
            const isConnected = await client.testConnection();
            spinner.stop();
            if (isConnected) {
              console.log(chalk.green('✅ Connection successful!'));
              const info = await client.getServerInfo();
              console.log(chalk.gray(`📡 Server: ${info.baseUrl || client.baseUrl}`));
              console.log(chalk.gray(`🤖 Model: ${info.model || client.model}`));
            } else {
              console.log(chalk.red('❌ Connection failed!'));
            }
          } catch (error) {
            spinner.stop();
            handleError(error);
          }
        }

        console.log(); // Add spacing between actions
      } catch (error) {
        handleError(error);
      }
    }
  });

// Command: Send a quick prompt
program
  .command('ask <prompt>')
  .alias('a')
  .description('Send a quick prompt')
  .option('-m, --model <model>', 'Model to use', 'deepseek-r1:8b')
  .option('-s, --stream', 'Enable streaming response')
  .action(async (prompt, options) => {
    const spinner = ora('Thinking...').start();

    try {
      if (options.stream) {
        spinner.stop();
        console.log(chalk.green('📝 Streaming response:'));
        console.log(chalk.white('─'.repeat(50)));

        let fullResponse = '';
        await client.generateStream(prompt, (chunk) => {
          if (chunk.response) {
            process.stdout.write(chunk.response);
            fullResponse += chunk.response;
          }
        }, { model: options.model });

        console.log('\n' + chalk.white('─'.repeat(50)));
      } else {
        const response = await client.generate(prompt, { model: options.model });
        spinner.stop();
        formatResponse(response);
      }
    } catch (error) {
      spinner.stop();
      handleError(error);
    }
  });

// Command: Use template
program
  .command('template <name>')
  .alias('t')
  .description('Use a prompt template')
  .option('-v, --vars <vars>', 'Variables in JSON format', '{}')
  .option('-m, --model <model>', 'Model to use', 'deepseek-r1:8b')
  .action(async (name, options) => {
    try {
      let variables = {};
      if (options.vars !== '{}') {
        try {
          variables = JSON.parse(options.vars);
        } catch (error) {
          console.error(chalk.red('❌ Invalid JSON format for variables'));
          return;
        }
      }

      const spinner = ora('Thinking...').start();
      const response = await client.generateFromTemplate(name, variables, { model: options.model });
      spinner.stop();
      formatResponse(response);
    } catch (error) {
      handleError(error);
    }
  });

// Command: List templates
program
  .command('list')
  .alias('l')
  .description('List available prompt templates')
  .action(async () => {
    try {
      const templates = await client.listPromptTemplates();
      if (templates.length === 0) {
        console.log(chalk.yellow('📭 No templates found.'));
        console.log(chalk.gray('Create templates in the prompts/ directory with .txt extension.'));
      } else {
        console.log(chalk.blue('📝 Available templates:'));
        templates.forEach((template, index) => {
          console.log(chalk.cyan(`  ${index + 1}. ${template}`));
        });
      }
    } catch (error) {
      handleError(error);
    }
  });

// Command: Test connection
program
  .command('test')
  .description('Test connection to DeepSeek server')
  .action(async () => {
    const spinner = ora('Testing connection...').start();
    try {
      const isConnected = await client.testConnection();
      spinner.stop();

      if (isConnected) {
        console.log(chalk.green('✅ Connection successful!'));
        const info = await client.getServerInfo();
        console.log(chalk.gray(`📡 Server: ${info.baseUrl || client.baseUrl}`));
        console.log(chalk.gray(`🤖 Model: ${info.model || client.model}`));
      } else {
        console.log(chalk.red('❌ Connection failed!'));
      }
    } catch (error) {
      spinner.stop();
      handleError(error);
    }
  });

// Default command
program
  .description('DeepSeek Client - A friendly interface for your DeepSeek model')
  .version('1.0.0');

// If no command is provided, start interactive mode
if (process.argv.length === 2) {
  program.parse(['node', 'cli.js', 'interactive']);
} else {
  program.parse();
}
