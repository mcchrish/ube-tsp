import type { KyInstance, KyResponse, Options } from 'ky';

interface ApiResponse<
  T extends { statusCode: number | string; content: unknown },
> {
  data: T['content'];
  response: KyResponse;
  status: T['statusCode'];
}

type ClientFromSpec<T> = {
  [K in keyof T]: T[K] extends { request: infer Req; response: infer Res }
    ? Res extends { statusCode: number | string; content: unknown }
      ? (
          params?: RequestParams &
            (Req extends { parameters: infer P } ? P : {}) &
            (Req extends { body: infer B } ? { body: B } : {}),
        ) => Promise<ApiResponse<Res>>
      : never
    : T[K] extends Record<string, unknown>
      ? ClientFromSpec<T[K]>
      : never;
};

export interface RequestParams {
  path?: Record<string, string | number>;
  query?: Record<string, unknown>;
  body?: unknown;
  kyOptions?: Options;
}

export type OperationMap = Record<
  string,
  {
    method: string;
    path: string;
    operationId: string;
    statusCodes?: (string | number)[];
    contentType?: string;
  }
>;

/**
 * Creates a type-safe API client from an OpenAPI-style specification
 *
 * How the builder works:
 * 1. Takes a Ky instance (pre-configured with base URL, auth, etc.)
 * 2. Takes a spec mapping operation keys to HTTP method/path info
 * 3. Builds a nested client object that mirrors the spec structure
 * 4. Each endpoint becomes a function that makes HTTP requests via Ky
 *
 * @param ky - Pre-configured Ky instance with base URL, auth, interceptors, etc.
 * @param spec - Mapping of "Namespace.Resource.operation" keys to HTTP method/path
 * @returns Fully typed client with nested structure matching the spec
 */
export function createClient<T>(
  ky: KyInstance,
  spec: OperationMap,
): ClientFromSpec<T> {
  /**
   * Core HTTP request function used by all endpoints
   * Handles path parameter substitution, query serialization, and body encoding
   *
   */
  const makeRequest = async (
    method: string,
    path: string,
    params?: RequestParams,
    statusCodes?: (string | number)[],
    contentType?: string,
  ): Promise<{
    data: unknown;
    response: KyResponse;
    status: string | number;
  }> => {
    // Step 1: Replace path parameters (e.g., /pets/{petId} -> /pets/123)
    let url = path;
    if (params?.path) {
      Object.entries(params.path).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value));
      });
    }

    // Step 2: Build base request options, merging any custom options
    const options: Options = {
      method: method.toLowerCase() as NonNullable<Options['method']>,
      ...params?.kyOptions,
    };

    // Step 3: Serialize query parameters using OpenAPI form style
    // If options.searchParams exists, use it directly (full override)
    // Otherwise, build from query parameters
    if (params?.kyOptions?.searchParams) {
      options.searchParams = params.kyOptions.searchParams;
    } else if (params?.query) {
      const searchParams = new URLSearchParams();
      Object.entries(params.query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // OpenAPI form style: ?tags=dog&tags=cat (repeat parameter name)
          value.forEach((v) => {
            if (v != null) {
              searchParams.append(key, String(v));
            }
          });
        } else if (value != null) {
          searchParams.append(key, String(value));
        }
      });
      options.searchParams = searchParams;
    }

    // Step 4: Add body for POST/PUT/PATCH requests based on content type
    if (params?.body) {
      const requestContentType = contentType || 'application/json';

      if (requestContentType === 'application/json') {
        options.json = params.body;
      } else if (requestContentType === 'application/x-www-form-urlencoded') {
        options.body =
          params.body instanceof URLSearchParams
            ? params.body
            : new URLSearchParams(params.body as Record<string, string>);
      } else if (requestContentType === 'multipart/form-data') {
        options.body = params.body as FormData;
      } else if (requestContentType === 'text/plain') {
        options.body = String(params.body);
      } else {
        // For other content types, pass body as-is
        options.body = params.body as BodyInit;
      }
    }

    // Step 5: Execute HTTP request and parse response
    const response = await ky(url, options);
    const data = await response.json();

    // Step 6: Map HTTP status to spec status code
    let specStatus: string | number = response.status;

    if (statusCodes) {
      // First try exact match
      if (statusCodes.includes(response.status)) {
        specStatus = response.status;
      } else {
        // Then try pattern matching
        for (const statusCode of statusCodes) {
          if (typeof statusCode === 'string') {
            if (statusCode === 'default') {
              specStatus = statusCode;
              break;
            }
            if (
              statusCode === '4XX' &&
              response.status >= 400 &&
              response.status < 500
            ) {
              specStatus = statusCode;
              break;
            }
            if (
              statusCode === '5XX' &&
              response.status >= 500 &&
              response.status < 600
            ) {
              specStatus = statusCode;
              break;
            }
            if (
              statusCode === '2XX' &&
              response.status >= 200 &&
              response.status < 300
            ) {
              specStatus = statusCode;
              break;
            }
            if (
              statusCode === '3XX' &&
              response.status >= 300 &&
              response.status < 400
            ) {
              specStatus = statusCode;
              break;
            }
          }
        }
      }
    }

    return {
      data,
      response,
      status: specStatus,
    };
  };

  /**
   * Builds the nested client object structure from the flat spec
   *
   * Algorithm:
   * 1. Iterate through each spec key (e.g., "Base.Pets.getPet")
   * 2. Split key into path parts ["Base", "Pets", "getPet"]
   * 3. Navigate/create nested objects for namespace parts
   * 4. At the leaf, create a function that calls makeRequest
   *
   */
  const buildNestedClient = (): ClientFromSpec<T> => {
    // Root client object that will hold all nested namespaces
    const client: Record<string, unknown> = {};

    // Process each operation in the spec
    Object.keys(spec).forEach((specKey) => {
      const operation = spec[specKey];
      if (!operation) return; // Skip if operation is undefined

      const pathParts = specKey.split('.'); // ["Base", "Pets", "getPet"]

      // Navigate/build nested structure
      let current: Record<string, unknown> = client;
      pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
          // Leaf node: create the actual endpoint function
          current[part] = async (params?: RequestParams) => {
            return await makeRequest(
              operation.method,
              operation.path,
              params,
              operation.statusCodes,
              operation.contentType,
            );
          };
        } else {
          // Intermediate node: create/navigate to nested object
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part] as Record<string, unknown>;
        }
      });
    });

    return client as ClientFromSpec<T>;
  };

  // Build and return the complete client
  return buildNestedClient();
}
