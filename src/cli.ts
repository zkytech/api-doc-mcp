#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { OpenApiService } from './services/OpenApiService';
import { tools } from './tools';

const openApiService = OpenApiService.getInstance();

async function main() {
  const [,, apiUrl] = process.argv;

  if (!apiUrl) {
    console.log('Usage: api-doc-mcp <API_DOC_URL>');
    process.exit(1);
  }

  try {
    // 加载 API 文档
    await openApiService.loadSpec(apiUrl);
    
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
      // server.setRequestHandler(CallToolRequestSchema, async (request) => {
      //   if (request.params.name === name) {
      //     return tool.handler(request.params.arguments || {});
      //   }
      //   throw new Error(`Tool ${request.params.name} not found`);
      // });
      server.tool(
        name,
        tool.parameters,
        tool.handler
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