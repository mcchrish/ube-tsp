import ky, { type KyInstance, type Options as KyOptions } from 'ky';

export class KyClient {
  private kyInstance: KyInstance;

  constructor(baseUrl: string, options?: KyOptions) {
    this.kyInstance = ky.create({
      prefixUrl: baseUrl,
      ...options,
    });
  }

  async get<T = unknown>(url: string, options?: KyOptions): Promise<T> {
    return this.kyInstance.get(url, options).json<T>();
  }

  async post<T = unknown>(url: string, body?: unknown, options?: KyOptions): Promise<T> {
    return this.kyInstance.post(url, { json: body, ...options }).json<T>();
  }

  async put<T = unknown>(url: string, body?: unknown, options?: KyOptions): Promise<T> {
    return this.kyInstance.put(url, { json: body, ...options }).json<T>();
  }

  async patch<T = unknown>(url: string, body?: unknown, options?: KyOptions): Promise<T> {
    return this.kyInstance.patch(url, { json: body, ...options }).json<T>();
  }

  async delete<T = unknown>(url: string, options?: KyOptions): Promise<T> {
    return this.kyInstance.delete(url, options).json<T>();
  }

  getRawInstance(): KyInstance {
    return this.kyInstance;
  }
}