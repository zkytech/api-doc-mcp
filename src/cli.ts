#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { OpenApiService } from './services/OpenApiService';
import { tools } from './tools';

async function main() {
  const [,, source] = process.argv;

  if (!source) {
    console.log('Usage: api-doc-mcp <API_DOC_URL_OR_FILE_PATH>');
    console.log('Examples:');
    console.log('  api-doc-mcp https://api.example.com/swagger.json');
    console.log('  api-doc-mcp ./swagger.json');
    process.exit(1);
  }

  try {
    const openApiService = new OpenApiService();
    // 加载 API 文档
    await openApiService.loadSpec(source);
    
    // 创建 MCP 服务器
    const server = new McpServer({
      name: 'api-doc-mcp',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });

    // 注册所有工具
    Object.entries(tools).forEach(([name, tool]) => {
      server.tool(
        name,
        tool.parameters,
        async (args) => {
          // 每次调用工具时重新加载文档
          await openApiService.loadSpec(source);
          return tool.handler(args);
        }
      )
    });

    // 启动服务器
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.log('MCP Server is running...');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main(); 