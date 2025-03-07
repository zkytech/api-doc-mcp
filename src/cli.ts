#!/usr/bin/env node
import { tools } from './tools';
import { Tool, ToolParameters } from './types';
import { OpenApiService } from './services/OpenApiService';

const openApiService = OpenApiService.getInstance();

async function showHelp() {
  console.log('Usage: api-doc-mcp <API_DOC_URL> <command> [parameters]');
  console.log('\nAvailable commands:');
  Object.entries(tools).forEach(([name, tool]) => {
    console.log(`\n${name}:`);
    console.log(`  Description: ${tool.description}`);
    if (Object.keys(tool.parameters).length > 0) {
      console.log('  Parameters:');
      Object.entries(tool.parameters).forEach(([paramName, param]) => {
        console.log(`    - ${paramName}: ${param.description}`);
      });
    }
  });
}

async function main() {
  // Get URL, tool name and parameters from command line arguments
  const [,, apiUrl, toolName, ...args] = process.argv;

  if (!apiUrl || !toolName) {
    await showHelp();
    process.exit(1);
  }

  // Load API documentation first
  try {
    await openApiService.loadSpec(apiUrl);
  } catch (error) {
    console.error('Failed to load API documentation:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const tool = tools[toolName];
  if (!tool) {
    console.error(`Command not found: ${toolName}`);
    await showHelp();
    process.exit(1);
  }

  try {
    // Parse parameters
    const params: Record<string, string> = {};
    args.forEach((arg, index) => {
      if (index % 2 === 0 && args[index + 1]) {
        const key = arg.replace(/^--/, '');
        params[key] = args[index + 1];
      }
    });

    // Construct parameter object based on tool parameter definitions
    let toolParams: ToolParameters;
    const paramKeys = Object.keys(tool.parameters);
    
    if (paramKeys.length === 0) {
      toolParams = {};
    } else if (paramKeys.includes('url')) {
      toolParams = { url: params.url };
    } else if (paramKeys.includes('groupName')) {
      toolParams = { groupName: params.groupName };
    } else if (paramKeys.includes('path') && paramKeys.includes('method')) {
      toolParams = { path: params.path, method: params.method };
    } else if (paramKeys.includes('keyword')) {
      toolParams = { keyword: params.keyword };
    } else {
      throw new Error('Invalid tool parameters');
    }

    // Validate required parameters
    for (const key of paramKeys) {
      if (!(key in (toolParams as Record<string, unknown>))) {
        throw new Error(`Missing required parameter: ${key}`);
      }
    }

    const result = await tool.handler(toolParams);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Execution error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main(); 