import { OpenApiService } from '../services/OpenApiService';
import { Tool, ToolParameters } from '../types';

const openApiService = OpenApiService.getInstance();

export const tools: Record<string, Tool> = {
  listApiGroups: {
    description: 'List all available API groups',
    parameters: {},
    handler: async (params: ToolParameters) => {
      const groups = openApiService.getApiGroups();
      return groups.map(group => ({
        name: group.name,
        description: group.description,
        apiCount: group.apis.length
      }));
    }
  },

  listGroupApis: {
    description: 'List all APIs in the specified group',
    parameters: {
      groupName: {
        type: 'string',
        description: 'API group name, for example: user, product'
      }
    },
    handler: async (params: ToolParameters) => {
      if (!('groupName' in params)) {
        throw new Error('Missing groupName parameter');
      }
      const apis = openApiService.getGroupApis(params.groupName);
      return apis.map(api => ({
        path: api.path,
        method: api.method,
        summary: api.summary
      }));
    }
  },

  getApiDetail: {
    description: 'Get detailed information of the specified API',
    parameters: {
      path: {
        type: 'string',
        description: 'API path'
      },
      method: {
        type: 'string',
        description: 'HTTP method'
      }
    },
    handler: async (params: ToolParameters) => {
      if (!('path' in params) || !('method' in params)) {
        throw new Error('Missing path or method parameter');
      }
      const detail = openApiService.getApiDetail(params.path, params.method);
      if (!detail) {
        throw new Error('Specified API not found');
      }
      return detail;
    }
  },

  searchApis: {
    description: 'Search API',
    parameters: {
      keyword: {
        type: 'string',
        description: 'Search keyword'
      }
    },
    handler: async (params: ToolParameters) => {
      if (!('keyword' in params)) {
        throw new Error('Missing keyword parameter');
      }
      const results = openApiService.searchApis(params.keyword);
      return results.map(result => ({
        path: result.path,
        method: result.method,
        summary: result.summary
      }));
    }
  }
}; 