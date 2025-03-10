# api-doc-mcp

This is a set of MCP tools for managing and retrieving OpenAPI documentation.

## Features

This toolkit provides the following features:

1. List all API groups
2. List APIs in a specified group
3. Get API details
4. Search APIs
5. Support both remote API docs and local JSON files
6. Auto-refresh API documentation on each request

## Usage

### For cursor

```bash
# remote api
npx -y api-doc-mcp http://localhost:8000/swagger.json

# local file
npx -y api-doc-mcp ./swagger.json
```

## Build

```bash
npm run build
```

## Usage

### Command Format

```bash
npx api-doc-mcp <API_DOC_URL_OR_FILE_PATH>
```

### Examples

1. View help:
```bash
npx api-doc-mcp
```

2. List all API groups (Remote API):
```bash
npx api-doc-mcp https://api.example.com/swagger.json
```

3. List all API groups (Local file):
```bash
npx api-doc-mcp ./swagger.json
```

## Development

```bash
npm run dev
```

## Tool Description

### listApiGroups

List all available API groups.

Returns:
- name: Group name
- description: Group description
- apiCount: API count

### listGroupApis

List all APIs in a specified group.

Parameters:
- groupName: API group name

Returns:
- path: API path
- method: HTTP method
- summary: API summary

### getApiDetail

Get detailed information about a specified API.

Parameters:
- path: API path
- method: HTTP method

Returns:
- Complete API details, including parameters, request body, and response definition

### searchApis

Search APIs.

Parameters:
- keyword: Search keyword

Returns:
- path: API path
- method: HTTP method
- summary: API summary 
