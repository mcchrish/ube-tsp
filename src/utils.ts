import { Operation, Program, Type } from '@typespec/compiler';
import { getHttpOperation, HttpOperation } from '@typespec/http';
import {
  getExtensions,
  getExternalDocs,
  getOperationId,
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
  originalName: string; // Preserve original name for proper quoting (headers, etc.)
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
  const [httpOperation] = getHttpOperation(program, operation);

  const operationId =
    getOperationId(program, operation) ??
    (operation.namespace?.name
      ? `${operation.namespace.name}_${operation.name}`
      : operation.name);
  const externalDocs = getExternalDocs(program, operation);
  const extensions = getExtensions(program, operation);

  const operationInfo: OperationInfo = {
    name: operation.name,
    operationId,
    method: httpOperation.verb.toUpperCase() as HTTPMethod,
    path: httpOperation.path,
    summary: undefined,
    description: undefined,
    parameters: extractParameters(httpOperation),
    responses: extractResponses(operation, httpOperation),
    externalDocs,
    extensions: extensions ? Object.fromEntries(extensions) : undefined,
  };

  return operationInfo;
}

/**
 * Extract parameter information from operation
 */
function extractParameters(httpOperation: HttpOperation): ParameterInfo[] {
  const parameters: ParameterInfo[] = [];

  if (!httpOperation || !httpOperation.parameters) {
    return parameters;
  }

  // Extract parameters from HTTP operation metadata
  for (const param of httpOperation.parameters.parameters) {
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

    // Debug: Log parameter name to see what TypeSpec provides
    console.log('Parameter from TypeSpec:', {
      name: param.name,
      location,
      param: param.param
    });

    parameters.push({
      name: param.name,
      originalName: param.name, // Store original name before any transformations
      location,
      type: param.param.type,
      optional: param.param.optional || false,
      description: undefined,
    });
  }

  // Handle body parameters
  if (httpOperation.parameters.body) {
    const bodyName = httpOperation.parameters.body.property?.name || 'body';
    parameters.push({
      name: bodyName,
      originalName: bodyName,
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
  operation: Operation,
  httpOperation: HttpOperation,
): ResponseInfo[] {
  const responses: ResponseInfo[] = [];

  // Check if operation has explicit HTTP responses
  if (
    httpOperation &&
    httpOperation.responses &&
    httpOperation.responses.length > 0
  ) {
    // Parse explicit responses from HttpOperation.responses array
    for (const response of httpOperation.responses) {
      // Extract status code - handle different possible types
      let statusCode = 200;
      const statusCodes = response.statusCodes;

      if (typeof statusCodes === 'number') {
        statusCode = statusCodes;
      } else {
        // For non-number types (ranges, strings, etc.), default to 200 for now
        // TODO: Implement proper range parsing when we have real examples
        statusCode = 200;
      }

      responses.push({
        statusCode,
        type: response.type || operation.returnType,
        description: response.description,
      });
    }
  } else {
    // Determine appropriate default status code based on operation and return type
    let defaultStatusCode = 200;

    // Use 204 for void returns or DELETE operations
    if (
      operation.returnType.kind === 'Intrinsic' &&
      operation.returnType.name === 'void'
    ) {
      defaultStatusCode = 204;
    } else if (httpOperation && httpOperation.verb === 'delete') {
      defaultStatusCode = 204;
    }

    responses.push({
      statusCode: defaultStatusCode,
      type: operation.returnType,
      description: undefined,
    });
  }

  // Ensure we have at least one response
  if (responses.length === 0) {
    // Determine appropriate default status code based on operation and return type
    let defaultStatusCode = 200;

    // Use 204 for void returns or DELETE operations
    if (
      operation.returnType.kind === 'Intrinsic' &&
      operation.returnType.name === 'void'
    ) {
      defaultStatusCode = 204;
    } else if (httpOperation && httpOperation.verb === 'delete') {
      defaultStatusCode = 204;
    }

    responses.push({
      statusCode: defaultStatusCode,
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
