import type { KyInstance, Options } from "ky";
import type { ApiResponse, Operation, OperationMap, RequestParams } from "./types.js";
import { buildHeaders, buildQueryParams, buildRequestBody, buildUrlWithPathParams } from "./utils/params.js";
import { resolveResponseStatus } from "./utils/response.js";

/**
 * Creates a type-safe API client from flat operation map
 * Transforms flat operation keys into nested client methods with full type safety
 *
 * @param ky - Ky HTTP client instance for making requests
 * @param operationMap - Runtime operation map with flat keys and HTTP details
 * @returns Nested client object with type-safe method calls
 */
export function createClient<T>(ky: KyInstance, operationMap: OperationMap): T {
  const makeRequest = async (
    { path, method, response }: Operation,
    params?: RequestParams,
    kyOptions?: Options,
  ): Promise<ApiResponse> => {
    const url = buildUrlWithPathParams(path, params);

    const headers = buildHeaders(params);
    const queryParams = kyOptions?.searchParams ?? buildQueryParams(params);
    const requestBody = buildRequestBody(params);

    const options: Options = {
      method: method.toLowerCase() as NonNullable<Options["method"]>,
      ...kyOptions,
      ...(headers && { headers: { ...headers, ...kyOptions?.headers } }),
      ...(queryParams && { searchParams: queryParams }),
      ...(requestBody !== undefined && { body: requestBody }),
    };

    const kyResponse = await ky(url, options);
    const content = await kyResponse.json();
    const statusCode = resolveResponseStatus(kyResponse, Object.keys(response));

    return {
      response: {
        statusCode,
        content,
      },
      kyResponse,
    };
  };

  const client: Record<string, unknown> = {};

  Object.keys(operationMap).forEach((operationKey) => {
    const operation = operationMap[operationKey];
    if (!operation) return;

    const pathParts = operationKey.split(".");
    let current = client;

    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        current[part] = async (params?: RequestParams, kyOptions?: Options) =>
          makeRequest(operation, params, kyOptions);
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
    });
  });

  return client as T;
}
