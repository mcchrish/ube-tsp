/**
 * Generates common.types.ts with shared utilities and types
 */
export function CommonTypesGenerator() {
  let result = '';

  result += '/**\n';
  result += ' * Common types and utilities shared across all generated files\n';
  result += ' */\n';
  result += '\n';

  // HTTP Methods
  result += '/**\n';
  result += ' * HTTP methods supported by the API\n';
  result += ' */\n';
  result +=
    "export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';\n";
  result += '\n';

  // Status Codes
  result += '/**\n';
  result += ' * HTTP status codes\n';
  result += ' */\n';
  result += 'export type StatusCode = number;\n';
  result += '\n';

  // Common Status Codes
  result += '/**\n';
  result += ' * Common HTTP status codes\n';
  result += ' */\n';
  result += 'export const HTTP_STATUS = {\n';
  result += '  OK: 200,\n';
  result += '  CREATED: 201,\n';
  result += '  ACCEPTED: 202,\n';
  result += '  NO_CONTENT: 204,\n';
  result += '  BAD_REQUEST: 400,\n';
  result += '  UNAUTHORIZED: 401,\n';
  result += '  FORBIDDEN: 403,\n';
  result += '  NOT_FOUND: 404,\n';
  result += '  METHOD_NOT_ALLOWED: 405,\n';
  result += '  CONFLICT: 409,\n';
  result += '  UNPROCESSABLE_ENTITY: 422,\n';
  result += '  INTERNAL_SERVER_ERROR: 500,\n';
  result += '  NOT_IMPLEMENTED: 501,\n';
  result += '  BAD_GATEWAY: 502,\n';
  result += '  SERVICE_UNAVAILABLE: 503,\n';
  result += '} as const;\n';
  result += '\n';

  // Parameter Location Types
  result += '/**\n';
  result += ' * Parameter location types\n';
  result += ' */\n';
  result +=
    "export type ParameterLocation = 'query' | 'path' | 'header' | 'cookie' | 'body';\n";
  result += '\n';

  // API Error Interface
  result += '/**\n';
  result += ' * Standard API error format\n';
  result += ' */\n';
  result += 'export interface ApiError {\n';
  result += '  /** Error message */\n';
  result += '  message: string;\n';
  result += '  /** Error code */\n';
  result += '  code?: string;\n';
  result += '  /** Additional error details */\n';
  result += '  details?: Record<string, unknown>;\n';
  result += '}\n';

  return result;
}
