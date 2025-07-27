import type { KyResponse } from "ky";

/**
 * Standard parameter structure for API requests
 */
export interface RequestParams {
  params?: {
    path?: Record<string, unknown>;
    query?: Record<string, unknown>;
    header?: Record<string, unknown>;
  };
  body?: unknown;
}

/**
 * Standard API response structure
 */
export interface ApiResponseData {
  statusCode: number | string;
  headers?: Record<string, string>;
  content: unknown;
}

/**
 * Response wrapper for API calls containing the structured response and raw KyResponse
 */
export interface ApiResponse {
  response: ApiResponseData;
  kyResponse: KyResponse;
}

export interface Operation {
  method: string;
  path: string;
  operationId: string;
  statusCodes: (string | number)[];
  contentTypes: string[];
}
/**
 * Runtime operation specification mapping flat keys to HTTP operation details
 */
export type OperationMap = Record<string, Operation>;
