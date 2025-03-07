import { z } from 'zod';
import { OpenApiService } from '../services/OpenApiService';
import { MCPToolDefinition } from '../types';

const openApiService = OpenApiService.getInstance();

export const tools: Record<string, MCPToolDefinition> = {
  listApiGroups: {
    name: 'listApiGroups',
    description: 'List all available API groups',
    parameters: {},
    handler: async () => {
      const groups = openApiService.getApiGroups();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(groups.map(group => ({
            name: group.name,
            description: group.description,
            apiCount: group.apis.length
          })), null, 2)
        }]
      };
    }
  },

  listGroupApis: {
    name: 'listGroupApis',
    description: 'List all APIs in the specified group',
    parameters: {
      groupName: z.string().describe('API group name, for example: user, product')
    },
    handler: async (params) => {
      const apis = openApiService.getGroupApis(params.groupName);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(apis.map(api => ({
            path: api.path,
            method: api.method,
            description: api.description,
            summary: api.summary
          })), null, 2)
        }]
      };
    }
  },

  getApiDetail: {
    name: 'getApiDetail',
    description: 'Get detailed information of the specified API',
    parameters: {
      path: z.string().describe('API path'),
      method: z.string().describe('HTTP method')
    },
    handler: async (params) => {
      const detail = openApiService.getApiDetail(params.path, params.method);
      if (!detail) {
        throw new Error('Specified API not found');
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(detail, null, 2)
        }]
      };
    }
  },

  searchApis: {
    name: 'searchApis',
    description: 'Search API',
    parameters: {
      keyword: z.string().describe('Search keyword')
    },
    handler: async (params) => {
      const results = openApiService.searchApis(params.keyword);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results.map(result => ({
            path: result.path,
            method: result.method,
            summary: result.summary,
            description: result.description,
          })), null, 2)
        }]
      };
    }
  }
}; 