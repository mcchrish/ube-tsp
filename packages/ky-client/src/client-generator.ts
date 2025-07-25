import ky, { type KyInstance } from 'ky';
import type { KyClientOptions, GeneratedClient, OperationMetadata } from './types.js';

export function createKyClient(
  operations: Record<string, OperationMetadata>,
  options: KyClientOptions
): GeneratedClient {
  const kyInstance: KyInstance = ky.create({
    prefixUrl: options.baseUrl,
    ...options.kyOptions,
  });

  const client: GeneratedClient = {};

  for (const [operationName, metadata] of Object.entries(operations)) {
    client[operationName] = createOperationMethod(kyInstance, metadata);
  }

  return client;
}

function createOperationMethod(
  kyInstance: KyInstance,
  metadata: OperationMetadata
) {
  return async (params: any = {}) => {
    const { path: pathParams, query, header, body } = params;
    
    // Replace path parameters
    let url = metadata.path;
    if (pathParams) {
      for (const [key, value] of Object.entries(pathParams)) {
        url = url.replace(`{${key}}`, String(value));
      }
    }

    // Prepare request options
    const requestOptions: any = {
      method: metadata.method.toLowerCase(),
    };

    // Add query parameters
    if (query) {
      requestOptions.searchParams = query;
    }

    // Add headers
    if (header) {
      requestOptions.headers = header;
    }

    // Add body for POST/PUT/PATCH requests
    if (body && ['POST', 'PUT', 'PATCH'].includes(metadata.method.toUpperCase())) {
      requestOptions.json = body;
    }

    try {
      const response = await kyInstance(url, requestOptions);
      
      // Handle different response types
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text/')) {
        return await response.text();
      } else {
        return await response.blob();
      }
    } catch (error) {
      // Re-throw with enhanced error information
      throw error;
    }
  };
}