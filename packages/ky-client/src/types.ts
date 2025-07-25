import type { Options as KyOptions } from 'ky';

export interface KyClientOptions {
  baseUrl: string;
  kyOptions?: KyOptions;
}

export interface GeneratedClient {
  [operationName: string]: (...args: any[]) => Promise<any>;
}

export interface OperationMetadata {
  method: string;
  path: string;
  parameters?: {
    path?: Record<string, any>;
    query?: Record<string, any>;
    header?: Record<string, any>;
    body?: any;
  };
  responses: Record<string, any>;
}