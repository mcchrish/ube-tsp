import type { RequestParams } from "../types.js";

/**
 * Replaces path parameters in URL template with actual values
 * Trims leading slash for ky compatibility (ky throws error with leading slash)
 */
export function buildUrlWithPathParams(
  path: string,
  params?: RequestParams,
): string {
  let url = path;

  // Replace path parameters if they exist
  if (params?.params?.path) {
    Object.entries(params.params.path).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value));
    });
  }

  // Trim leading slash for ky compatibility (single operation)
  return url.startsWith("/") ? url.slice(1) : url;
}

/**
 * Builds query parameters from params object
 */
export function buildQueryParams(
  params?: RequestParams,
): URLSearchParams | undefined {
  if (!params?.params?.query) {
    return undefined;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params.params.query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null) {
          searchParams.append(key, String(v));
        }
      });
    } else if (value != null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams;
}

/**
 * Builds headers from params object
 */
export function buildHeaders(
  params?: RequestParams,
): Record<string, string> | undefined {
  if (!params?.params?.header) {
    return undefined;
  }

  const headers: Record<string, string> = {};
  Object.entries(params.params.header).forEach(([key, value]) => {
    if (value != null) {
      headers[key] = String(value);
    }
  });
  return Object.keys(headers).length > 0 ? headers : undefined;
}

/**
 * Builds request body based on body type
 */
export function buildRequestBody(params?: RequestParams): BodyInit | undefined {
  if (!params || params.body === undefined) {
    return undefined;
  }

  // If it's URLSearchParams, pass as-is
  if (params.body instanceof URLSearchParams) {
    return params.body;
  }

  // If it's FormData, pass as-is
  if (params.body instanceof FormData) {
    return params.body;
  }

  // For objects or any other JS primitives, JSON stringify to body
  return JSON.stringify(params.body);
}
