import { z } from 'zod';

export interface ApiGroup {
  name: string;
  description?: string;
  apis: ApiInfo[];
}

export interface ApiInfo {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tags?: string[];
}

export interface ApiDetail extends ApiInfo {
  parameters?: any[];
  requestBody?: any;
  responses?: Record<string, any>;
}

export interface ApiSearchResult {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tags?: string[];
  score: number;
}

export interface ApiGroupSummary {
  name: string;
  description?: string;
  apiCount: number;
}

export interface ApiSearchResultSummary {
  path: string;
  method: string;
  summary?: string;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, z.ZodType>;
  handler: (params: Record<string, any>) => Promise<any>;
}

export type ToolParameters = 
  | { url: string }
  | { groupName: string }
  | { path: string; method: string }
  | { keyword: string }
  | Record<string, never>;

export interface Tool {
  description: string;
  parameters: Record<string, { type?: string; description: string }>;
  handler: (params: ToolParameters) => Promise<
    | ApiGroupSummary[]
    | ApiSearchResultSummary[]
    | ApiDetail
    | { success: boolean; message: string }
  >;
} 