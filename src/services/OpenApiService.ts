import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import axios from 'axios';
import { ApiGroup, ApiInfo, ApiDetail, ApiSearchResult } from '../types';

export class OpenApiService {
  private spec: OpenAPIV3.Document | null = null;
  private dereferencedSpec: OpenAPIV3.Document | null = null;
  private apiUrl: string = '';

  constructor() {}

  async loadSpec(source: string): Promise<void> {
    this.apiUrl = source;
    let data;
    
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const response = await axios.get(source);
      data = response.data;
    } else {
      // 如果不是 URL，则认为是本地文件路径
      const fs = require('fs');
      const path = require('path');
      const resolvedPath = path.resolve(source);
      data = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    }
    
    this.spec = await SwaggerParser.parse(data) as OpenAPIV3.Document;
    this.dereferencedSpec = await SwaggerParser.dereference(data) as OpenAPIV3.Document;
  }

  getApiGroups(): ApiGroup[] {
    if (!this.spec || !this.spec.paths) {
      throw new Error('OpenAPI spec not loaded');
    }

    const groups = new Map<string, ApiGroup>();

    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      if (!pathItem) return;

      Object.entries(pathItem).forEach(([method, operation]) => {
        if (method === '$ref' || !operation || typeof operation !== 'object') return;

        const operationObject = operation as OpenAPIV3.OperationObject;
        const tags = operationObject.tags || ['default'];
        
        tags.forEach((tag: string) => {
          if (!groups.has(tag)) {
            groups.set(tag, {
              name: tag,
              description: this.spec?.tags?.find(t => t.name === tag)?.description,
              apis: []
            });
          }

          const group = groups.get(tag)!;
          group.apis.push({
            path,
            method: method.toUpperCase(),
            summary: operationObject.summary,
            description: operationObject.description,
            tags: operationObject.tags
          });
        });
      });
    });

    return Array.from(groups.values());
  }

  getGroupApis(groupName: string): ApiInfo[] {
    const group = this.getApiGroups().find(g => g.name === groupName);
    if (!group) {
      throw new Error(`Group ${groupName} not found`);
    }
    return group.apis;
  }

  getApiDetail(path: string, method: string): ApiDetail | null {
    if (!this.dereferencedSpec || !this.dereferencedSpec.paths || !this.dereferencedSpec.paths[path]) {
      return null;
    }

    const pathItem = this.dereferencedSpec.paths[path];
    const methodKey = method.toLowerCase() as OpenAPIV3.HttpMethods;
    const operation = pathItem[methodKey] as OpenAPIV3.OperationObject | undefined;

    if (!operation) {
      return null;
    }

    return {
      path,
      method: method.toUpperCase(),
      summary: operation.summary,
      description: operation.description,
      tags: operation.tags,
      parameters: operation.parameters as OpenAPIV3.ParameterObject[],
      requestBody: operation.requestBody,
      responses: operation.responses
    };
  }

  searchApis(keyword: string): ApiSearchResult[] {
    if (!this.spec || !this.spec.paths) {
      return [];
    }

    const results: ApiSearchResult[] = [];
    const lowerKeyword = keyword.toLowerCase();

    Object.entries(this.spec.paths).forEach(([path, pathItem]) => {
      if (!pathItem) return;

      Object.entries(pathItem).forEach(([method, operation]) => {
        if (method === '$ref' || !operation || typeof operation !== 'object') return;

        const operationObject = operation as OpenAPIV3.OperationObject;
        
        const score = this.calculateSearchScore(
          path,
          operationObject.summary || '',
          operationObject.description || '',
          operationObject.tags || [],
          lowerKeyword
        );

        if (score > 0) {
          results.push({
            path,
            method: method.toUpperCase(),
            summary: operationObject.summary,
            description: operationObject.description,
            tags: operationObject.tags,
            score
          });
        }
      });
    });

    return results.sort((a, b) => b.score - a.score);
  }

  private calculateSearchScore(
    path: string,
    summary: string,
    description: string,
    tags: string[],
    keyword: string
  ): number {
    let score = 0;

    if (path.toLowerCase().includes(keyword)) score += 3;
    if (summary.toLowerCase().includes(keyword)) score += 2;
    if (description.toLowerCase().includes(keyword)) score += 1;
    if (tags.some(tag => tag.toLowerCase().includes(keyword))) score += 2;

    return score;
  }
} 