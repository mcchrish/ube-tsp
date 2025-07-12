import { Operation, Program, Type } from '@typespec/compiler';
import { getHttpOperation } from '@typespec/http';
import {
  getOperationId,
  getExternalDocs,
  getExtensions,
} from '@typespec/openapi';

/**
 * HTTP Method types
 */
export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'TRACE';

/**
 * Parameter location types
 */
export type ParameterLocation = 'query' | 'path' | 'header' | 'cookie' | 'body';

/**
 * Parameter information
 */
export interface ParameterInfo {
  name: string;
  location: ParameterLocation;
  type: Type;
  optional: boolean;
  description?: string;
}

/**
 * Response information
 */
export interface ResponseInfo {
  statusCode: number;
  type: Type;
  description?: string;
}

/**
 * Enhanced operation information with OpenAPI metadata
 */
export interface OperationInfo {
  name: string;
  operationId?: string;
  method: HTTPMethod;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters: ParameterInfo[];
  responses: ResponseInfo[];
  externalDocs?: {
    url: string;
    description?: string;
  };
  extensions?: Record<string, unknown>;
}

/**
 * Extract comprehensive operation information including OpenAPI metadata
 */
export function extractOperationInfo(
  program: Program,
  operation: Operation,
): OperationInfo {
  const httpOperation = getHttpOperation(program, operation);

  if (!httpOperation) {
    throw new Error(`Operation ${operation.name} is not an HTTP operation`);
  }

  const operationId = getOperationId(program, operation);
  const externalDocs = getExternalDocs(program, operation);
  const extensions = getExtensions(program, operation);

  const operationInfo: OperationInfo = {
    name: operation.name || 'unnamed',
    operationId,
    method: (httpOperation[0]?.verb?.toUpperCase() || 'GET') as HTTPMethod,
    path: httpOperation[0]?.path || '',
    summary: undefined,
    description: undefined,
    parameters: extractParameters(program, operation, httpOperation[0]),
    responses: extractResponses(program, operation, httpOperation[0]),
    externalDocs,
    extensions: extensions ? Object.fromEntries(extensions) : undefined,
  };

  return operationInfo;
}

/**
 * Extract parameter information from operation
 */
function extractParameters(
  program: Program,
  operation: Operation,
  httpOperation: any,
): ParameterInfo[] {
  const parameters: ParameterInfo[] = [];

  if (!httpOperation || !httpOperation.parameters) {
    return parameters;
  }

  // Extract parameters from HTTP operation metadata
  for (const param of httpOperation.parameters.parameters || []) {
    let location: ParameterLocation = 'query';

    switch (param.type) {
      case 'path':
        location = 'path';
        break;
      case 'query':
        location = 'query';
        break;
      case 'header':
        location = 'header';
        break;
      case 'cookie':
        location = 'cookie';
        break;
    }

    parameters.push({
      name: param.name,
      location,
      type: param.param.type,
      optional: param.param.optional || false,
      description: undefined,
    });
  }

  // Handle body parameters
  if (httpOperation.parameters.body) {
    parameters.push({
      name: httpOperation.parameters.body.property?.name || 'body',
      location: 'body',
      type: httpOperation.parameters.body.type,
      optional: false,
      description: undefined,
    });
  }

  return parameters;
}

/**
 * Extract response information from operation
 */
function extractResponses(
  program: Program,
  operation: Operation,
  httpOperation: any,
): ResponseInfo[] {
  const responses: ResponseInfo[] = [];

  // Check if operation has explicit HTTP responses
  if (httpOperation && httpOperation.responses && typeof httpOperation.responses.entries === 'function') {
    // Parse explicit responses from HTTP operation
    for (const [statusCode, response] of httpOperation.responses.entries()) {
      responses.push({
        statusCode: parseInt(statusCode.toString(), 10),
        type: response.type || operation.returnType,
        description: response.description,
      });
    }
  } else {
    // Always default to 200 status code for now
    responses.push({
      statusCode: 200,
      type: operation.returnType,
      description: undefined,
    });
  }

  // Ensure we have at least one response
  if (responses.length === 0) {
    responses.push({
      statusCode: 200,
      type: operation.returnType,
      description: undefined,
    });
  }

  return responses;
}

/**
 * Group parameters by location
 */
export function groupParametersByLocation(
  parameters: ParameterInfo[],
): Record<ParameterLocation, ParameterInfo[]> {
  const grouped: Record<ParameterLocation, ParameterInfo[]> = {
    query: [],
    path: [],
    header: [],
    cookie: [],
    body: [],
  };

  for (const param of parameters) {
    grouped[param.location].push(param);
  }

  return grouped;
}

/**
 * Check if operation has parameters of a specific location
 */
export function hasParametersOfLocation(
  parameters: ParameterInfo[],
  location: ParameterLocation,
): boolean {
  return parameters.some((param) => param.location === location);
}

/**
 * Get status codes from responses
 */
export function getStatusCodes(responses: ResponseInfo[]): number[] {
  return responses.map((r) => r.statusCode).sort((a, b) => a - b);
}

/**
 * Get unique status codes from responses
 */
export function getUniqueStatusCodes(responses: ResponseInfo[]): number[] {
  return [...new Set(getStatusCodes(responses))];
}

/**
 * Check if operation has a specific status code
 */
export function hasStatusCode(
  responses: ResponseInfo[],
  statusCode: number,
): boolean {
  return responses.some((r) => r.statusCode === statusCode);
}

/**
 * Get response by status code
 */
export function getResponseByStatusCode(
  responses: ResponseInfo[],
  statusCode: number,
): ResponseInfo | undefined {
  return responses.find((r) => r.statusCode === statusCode);
}

/**
 * Common HTTP status codes
 */
export const COMMON_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
