import type { KyResponse } from "ky";

/**
 * Determines the response status based on operation status codes
 */
export function resolveResponseStatus(response: KyResponse, statusCodes?: (string | number)[]): string | number {
  if (!statusCodes) {
    return response.status;
  }

  if (statusCodes.includes(response.status)) {
    return response.status;
  }

  for (const statusCode of statusCodes) {
    if (typeof statusCode === "string") {
      const status = response.status;
      if (
        statusCode === "default" ||
        (statusCode === "2XX" && status >= 200 && status < 300) ||
        (statusCode === "3XX" && status >= 300 && status < 400) ||
        (statusCode === "4XX" && status >= 400 && status < 500) ||
        (statusCode === "5XX" && status >= 500 && status < 600)
      ) {
        return statusCode;
      }
    }
  }

  return response.status;
}
