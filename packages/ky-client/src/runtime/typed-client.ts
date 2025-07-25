import { KyClient } from './ky-client.js';
import type { KyClientOptions } from '../types.js';

export function createTypedClient<TOperations extends Record<string, any>>(
  operations: TOperations,
  options: KyClientOptions
): TOperations & { _client: KyClient } {
  const client = new KyClient(options.baseUrl, options.kyOptions);
  
  const typedClient = {} as TOperations & { _client: KyClient };
  
  // Add the raw client for advanced usage
  typedClient._client = client;
  
  // Add operation methods
  for (const [operationName, operationFn] of Object.entries(operations)) {
    (typedClient as any)[operationName] = operationFn;
  }
  
  return typedClient;
}