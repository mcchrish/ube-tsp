import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { KyInstance, KyResponse } from 'ky';
import { createClient, type OperationMap } from '../src/main.js';

// Test-specific spec and types
const testSpec = {
  'Api.Pets.getPet': {
    operationId: 'getPet',
    method: 'GET',
    path: '/pets/{petId}',
  },
  'Api.Pets.getPets': {
    operationId: 'getPets',
    method: 'GET',
    path: '/pets',
  },
  'Api.Pets.createPet': {
    operationId: 'createPet',
    method: 'POST',
    path: '/pets',
  },
  'Api.Users.getUser': {
    operationId: 'getUser',
    method: 'GET',
    path: '/users/{userId}',
  },
  'Api.Orders.createOrder': {
    operationId: 'createOrder',
    method: 'POST',
    path: '/orders',
  },
} satisfies OperationMap;

type TestApiSpec = {
  Api: {
    Pets: {
      getPet: {
        request: {
          parameters: {
            path: { petId: number };
          };
        };
        response:
          | {
              statusCode: 200;
              contentType: 'application/json';
              content: { id: number; name: string; breed: string };
            }
          | {
              statusCode: 404;
              contentType: 'application/json';
              content: { error: string; message: string };
            };
      };
      getPets: {
        request: {
          parameters?: {
            query?: {
              limit?: number;
              offset?: number;
              breed?: string;
              tags?: string[];
              active?: boolean;
            };
          };
        };
        response: {
          statusCode: 200;
          contentType: 'application/json';
          content: { id: number; name: string; breed: string }[];
        };
      };
      createPet: {
        request: {
          body: {
            name: string;
            breed: string;
            age?: number;
          };
        };
        response:
          | {
              statusCode: 201;
              contentType: 'application/json';
              content: { id: number; name: string; breed: string };
            }
          | {
              statusCode: 400;
              contentType: 'application/json';
              content: {
                error: string;
                message: string;
                validationErrors?: string[];
              };
            };
      };
    };
    Users: {
      getUser: {
        request: {
          parameters: {
            path: { userId: string };
            query?: { include?: string[] };
          };
        };
        response: {
          statusCode: 200;
          contentType: 'application/json';
          content: { id: string; name: string; email: string };
        };
      };
    };
    Orders: {
      createOrder: {
        request: {
          body: {
            userId: string;
            items: { petId: number; quantity: number }[];
            total: number;
          };
        };
        response: {
          statusCode: 201;
          contentType: 'application/json';
          content: { orderId: string; status: string };
        };
      };
    };
  };
};

// Mock Ky instance
const createMockKy = () => {
  const mockResponse = {
    json: vi
      .fn()
      .mockResolvedValue({ id: 1, name: 'Fluffy', breed: 'Golden Retriever' }),
    text: vi.fn().mockResolvedValue(''),
    blob: vi.fn().mockResolvedValue(new Blob()),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    bytes: vi.fn().mockResolvedValue(new Uint8Array()),
    status: 200,
    statusText: 'OK',
    ok: true,
    headers: new Headers(),
    url: 'https://api.example.com/pets/1',
    redirected: false,
    type: 'basic' as ResponseType,
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    formData: vi.fn().mockResolvedValue(new FormData()),
  } as unknown as KyResponse;

  // Create a proper mock with all KyInstance methods
  const mockKy = vi
    .fn()
    .mockResolvedValue(mockResponse) as unknown as KyInstance;

  return { mockKy, mockResponse };
};

describe('createClient', () => {
  let mockKy: KyInstance;
  let client: ReturnType<typeof createClient<TestApiSpec>>;

  beforeEach(() => {
    const { mockKy: kyInstance } = createMockKy();
    mockKy = kyInstance;
    client = createClient<TestApiSpec>(mockKy, testSpec);
  });

  describe('client structure generation', () => {
    it('creates nested object structure from spec keys', () => {
      expect(client.Api).toBeDefined();
      expect(client.Api.Pets).toBeDefined();
      expect(client.Api.Users).toBeDefined();
      expect(client.Api.Orders).toBeDefined();
    });

    it('creates function endpoints at leaf nodes', () => {
      expect(typeof client.Api.Pets.getPet).toBe('function');
      expect(typeof client.Api.Pets.getPets).toBe('function');
      expect(typeof client.Api.Pets.createPet).toBe('function');
      expect(typeof client.Api.Users.getUser).toBe('function');
      expect(typeof client.Api.Orders.createOrder).toBe('function');
    });
  });

  describe('path parameter handling', () => {
    it('handles various path parameter scenarios', async () => {
      // Test numeric path parameter
      await client.Api.Pets.getPet({ path: { petId: 123 } });
      expect(mockKy).toHaveBeenCalledWith('/pets/123', { method: 'get' });

      // Test string path parameter
      await client.Api.Users.getUser({ path: { userId: 'user-456' } });
      expect(mockKy).toHaveBeenCalledWith('/users/user-456', { method: 'get' });

      // Test multiple path parameters using existing spec
      const complexSpec = {
        'Api.Posts.getComment': {
          operationId: 'getComment',
          method: 'GET',
          path: '/posts/{postId}/comments/{commentId}',
        },
      };

      type ComplexSpec = {
        Api: {
          Posts: {
            getComment: {
              request: {
                parameters: { path: { postId: number; commentId: number } };
              };
              response: {
                statusCode: 200;
                contentType: 'application/json';
                content: { id: number; text: string };
              };
            };
          };
        };
      };

      const complexClient = createClient<ComplexSpec>(mockKy, complexSpec);
      await complexClient.Api.Posts.getComment({
        path: { postId: 123, commentId: 456 },
      });
      expect(mockKy).toHaveBeenCalledWith('/posts/123/comments/456', {
        method: 'get',
      });
    });
  });

  describe('query parameter handling', () => {
    it('handles all query parameter types with OpenAPI form style', async () => {
      // Test simple, array, and mixed parameter types in one comprehensive test
      await client.Api.Pets.getPets({
        query: {
          limit: 5,
          offset: 10,
          breed: 'labrador',
          active: true,
          tags: ['small', 'friendly', 'trained'],
        },
      });

      const expectedSearchParams = new URLSearchParams();
      expectedSearchParams.append('limit', '5');
      expectedSearchParams.append('offset', '10');
      expectedSearchParams.append('breed', 'labrador');
      expectedSearchParams.append('active', 'true');
      expectedSearchParams.append('tags', 'small');
      expectedSearchParams.append('tags', 'friendly');
      expectedSearchParams.append('tags', 'trained');

      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'get',
        searchParams: expectedSearchParams,
      });
    });

    it('skips null and undefined query parameters', async () => {
      await client.Api.Pets.getPets({
        query: {
          limit: 10,
          offset: null as unknown,
          breed: undefined as unknown,
          active: true,
        },
      });

      const expectedSearchParams = new URLSearchParams();
      expectedSearchParams.append('limit', '10');
      expectedSearchParams.append('active', 'true');

      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'get',
        searchParams: expectedSearchParams,
      });
    });

    it('handles combined path and query parameters', async () => {
      await client.Api.Users.getUser({
        path: { userId: 'user-123' },
        query: { include: ['profile', 'preferences'] },
      });

      const expectedSearchParams = new URLSearchParams();
      expectedSearchParams.append('include', 'profile');
      expectedSearchParams.append('include', 'preferences');

      expect(mockKy).toHaveBeenCalledWith('/users/user-123', {
        method: 'get',
        searchParams: expectedSearchParams,
      });
    });
  });

  describe('body parameter handling', () => {
    it('sends JSON body for POST requests', async () => {
      const petData = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
      };

      await client.Api.Pets.createPet({ body: petData });

      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'post',
        json: petData,
      });
    });

    it('handles complex body structures', async () => {
      const orderData = {
        userId: 'user-123',
        items: [
          { petId: 1, quantity: 1 },
          { petId: 2, quantity: 2 },
        ],
        total: 299.99,
      };

      await client.Api.Orders.createOrder({ body: orderData });

      expect(mockKy).toHaveBeenCalledWith('/orders', {
        method: 'post',
        json: orderData,
      });
    });
  });

  describe('response handling', () => {
    it('returns both data and response object for success', async () => {
      const result = await client.Api.Pets.getPet({ path: { petId: 1 } });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('status');
      expect(result.data).toEqual({
        id: 1,
        name: 'Fluffy',
        breed: 'Golden Retriever',
      });
      expect(result.response).toHaveProperty('status', 200);
      expect(result.response).toHaveProperty('ok', true);
      expect(result.status).toBe(200);
    });

    it('handles error responses with proper typing', async () => {
      // Mock a 404 error response
      const errorResponse = {
        json: vi.fn().mockResolvedValue({
          error: 'NotFound',
          message: 'Pet with id 999 not found',
        }),
        status: 404,
        statusText: 'Not Found',
        ok: false,
        headers: new Headers(),
        url: 'https://api.example.com/pets/999',
      };

      const errorMockKy = vi
        .fn()
        .mockResolvedValue(errorResponse) as unknown as KyInstance;
      const errorClient = createClient<TestApiSpec>(errorMockKy, testSpec);

      const result = await errorClient.Api.Pets.getPet({
        path: { petId: 999 },
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('status');
      expect(result.data).toEqual({
        error: 'NotFound',
        message: 'Pet with id 999 not found',
      });
      expect(result.response).toHaveProperty('status', 404);
      expect(result.response).toHaveProperty('ok', false);
      expect(result.status).toBe(404);
    });

    it('handles validation error responses', async () => {
      // Mock a 400 validation error response
      const validationErrorResponse = {
        json: vi.fn().mockResolvedValue({
          error: 'ValidationError',
          message: 'Invalid input data',
          validationErrors: [
            'Name is required',
            'Breed must be at least 3 characters',
          ],
        }),
        status: 400,
        statusText: 'Bad Request',
        ok: false,
        headers: new Headers(),
        url: 'https://api.example.com/pets',
      };

      const validationMockKy = vi
        .fn()
        .mockResolvedValue(validationErrorResponse) as unknown as KyInstance;
      const validationClient = createClient<TestApiSpec>(
        validationMockKy,
        testSpec,
      );

      const result = await validationClient.Api.Pets.createPet({
        body: { name: '', breed: 'x' },
      });

      expect(result.data).toEqual({
        error: 'ValidationError',
        message: 'Invalid input data',
        validationErrors: [
          'Name is required',
          'Breed must be at least 3 characters',
        ],
      });
      expect(result.status).toBe(400);
      expect(result.response.ok).toBe(false);
    });
  });

  describe('HTTP method handling', () => {
    it('converts HTTP methods to lowercase', async () => {
      await client.Api.Pets.getPet({ path: { petId: 1 } });
      await client.Api.Pets.createPet({
        body: { name: 'Rex', breed: 'German Shepherd' },
      });

      expect(mockKy).toHaveBeenCalledWith('/pets/1', {
        method: 'get',
      });

      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'post',
        json: { name: 'Rex', breed: 'German Shepherd' },
      });
    });
  });

  describe('deeply nested specs', () => {
    it('handles 4+ level nesting', async () => {
      const deepSpec = {
        'Api.V1.Resources.Users.getProfile': {
          operationId: 'getProfile',
          method: 'GET',
          path: '/api/v1/users/{userId}/profile',
        },
        'Api.V1.Resources.Users.updateProfile': {
          operationId: 'updateProfile',
          method: 'PUT',
          path: '/api/v1/users/{userId}/profile',
        },
        'Api.V1.Resources.Orders.Items.getItem': {
          operationId: 'getItem',
          method: 'GET',
          path: '/api/v1/orders/{orderId}/items/{itemId}',
        },
        'Api.V2.Beta.Features.Analytics.getMetrics': {
          operationId: 'getMetrics',
          method: 'GET',
          path: '/api/v2/beta/analytics/metrics',
        },
      };

      type DeepSpec = {
        Api: {
          V1: {
            Resources: {
              Users: {
                getProfile: {
                  request: {
                    parameters: {
                      path: { userId: string };
                    };
                  };
                  response: {
                    statusCode: 200;
                    contentType: 'application/json';
                    content: { id: string; name: string; email: string };
                  };
                };
                updateProfile: {
                  request: {
                    parameters: {
                      path: { userId: string };
                    };
                    body: { name: string; email: string };
                  };
                  response: {
                    statusCode: 200;
                    contentType: 'application/json';
                    content: { id: string; name: string; email: string };
                  };
                };
              };
              Orders: {
                Items: {
                  getItem: {
                    request: {
                      parameters: {
                        path: { orderId: string; itemId: string };
                      };
                    };
                    response: {
                      statusCode: 200;
                      contentType: 'application/json';
                      content: { id: string; name: string; price: number };
                    };
                  };
                };
              };
            };
          };
          V2: {
            Beta: {
              Features: {
                Analytics: {
                  getMetrics: {
                    request: {
                      parameters?: {
                        query?: { from?: string; to?: string };
                      };
                    };
                    response: {
                      statusCode: 200;
                      contentType: 'application/json';
                      content: { metrics: number[]; timestamp: string };
                    };
                  };
                };
              };
            };
          };
        };
      };

      const deepClient = createClient<DeepSpec>(mockKy, deepSpec);

      // Test deep nesting structure exists
      expect(deepClient.Api).toBeDefined();
      expect(deepClient.Api.V1).toBeDefined();
      expect(deepClient.Api.V1.Resources).toBeDefined();
      expect(deepClient.Api.V1.Resources.Users).toBeDefined();
      expect(deepClient.Api.V1.Resources.Orders).toBeDefined();
      expect(deepClient.Api.V1.Resources.Orders.Items).toBeDefined();
      expect(deepClient.Api.V2).toBeDefined();
      expect(deepClient.Api.V2.Beta).toBeDefined();
      expect(deepClient.Api.V2.Beta.Features).toBeDefined();
      expect(deepClient.Api.V2.Beta.Features.Analytics).toBeDefined();

      // Test functions exist at correct depths
      expect(typeof deepClient.Api.V1.Resources.Users.getProfile).toBe(
        'function',
      );
      expect(typeof deepClient.Api.V1.Resources.Users.updateProfile).toBe(
        'function',
      );
      expect(typeof deepClient.Api.V1.Resources.Orders.Items.getItem).toBe(
        'function',
      );
      expect(typeof deepClient.Api.V2.Beta.Features.Analytics.getMetrics).toBe(
        'function',
      );

      // Test actual API calls work
      await deepClient.Api.V1.Resources.Users.getProfile({
        path: { userId: 'user-123' },
      });

      expect(mockKy).toHaveBeenCalledWith('/api/v1/users/user-123/profile', {
        method: 'get',
      });

      await deepClient.Api.V1.Resources.Orders.Items.getItem({
        path: { orderId: 'order-456', itemId: 'item-789' },
      });

      expect(mockKy).toHaveBeenCalledWith(
        '/api/v1/orders/order-456/items/item-789',
        {
          method: 'get',
        },
      );
    });

    it('handles mixed nesting depths in same spec', async () => {
      const mixedSpec = {
        simple: {
          operationId: 'simple',
          method: 'GET',
          path: '/simple',
        },
        'Api.Users.get': {
          operationId: 'getUsers',
          method: 'GET',
          path: '/api/users',
        },
        'Api.V1.Admin.Settings.Security.getConfig': {
          operationId: 'getSecurityConfig',
          method: 'GET',
          path: '/api/v1/admin/settings/security',
        },
      };

      type MixedSpec = {
        simple: {
          request: {};
          response: {
            statusCode: 200;
            contentType: 'application/json';
            content: { message: string };
          };
        };
        Api: {
          Users: {
            get: {
              request: {};
              response: {
                statusCode: 200;
                contentType: 'application/json';
                content: { users: string[] };
              };
            };
          };
          V1: {
            Admin: {
              Settings: {
                Security: {
                  getConfig: {
                    request: {};
                    response: {
                      statusCode: 200;
                      contentType: 'application/json';
                      content: { config: Record<string, unknown> };
                    };
                  };
                };
              };
            };
          };
        };
      };

      const mixedClient = createClient<MixedSpec>(mockKy, mixedSpec);

      // Test all nesting levels work
      expect(typeof mixedClient.simple).toBe('function');
      expect(typeof mixedClient.Api.Users.get).toBe('function');
      expect(typeof mixedClient.Api.V1.Admin.Settings.Security.getConfig).toBe(
        'function',
      );

      await mixedClient.simple({});
      expect(mockKy).toHaveBeenCalledWith('/simple', { method: 'get' });

      await mixedClient.Api.Users.get({});
      expect(mockKy).toHaveBeenCalledWith('/api/users', { method: 'get' });

      await mixedClient.Api.V1.Admin.Settings.Security.getConfig({});
      expect(mockKy).toHaveBeenCalledWith('/api/v1/admin/settings/security', {
        method: 'get',
      });
    });

    it('handles edge case with single character segments', async () => {
      const edgeSpec = {
        'A.B.C.D.E.F.deepEndpoint': {
          operationId: 'deepEndpoint',
          method: 'GET',
          path: '/a/b/c/d/e/f/deep',
        },
        'X.getResource': {
          operationId: 'getResource',
          method: 'GET',
          path: '/x/resource',
        },
      };

      type EdgeSpec = {
        A: {
          B: {
            C: {
              D: {
                E: {
                  F: {
                    deepEndpoint: {
                      request: {};
                      response: {
                        statusCode: 200;
                        contentType: 'application/json';
                        content: { deep: boolean };
                      };
                    };
                  };
                };
              };
            };
          };
        };
        X: {
          getResource: {
            request: {};
            response: {
              statusCode: 200;
              contentType: 'application/json';
              content: { resource: string };
            };
          };
        };
      };

      const edgeClient = createClient<EdgeSpec>(mockKy, edgeSpec);

      expect(typeof edgeClient.A.B.C.D.E.F.deepEndpoint).toBe('function');
      expect(typeof edgeClient.X.getResource).toBe('function');

      await edgeClient.A.B.C.D.E.F.deepEndpoint({});
      expect(mockKy).toHaveBeenCalledWith('/a/b/c/d/e/f/deep', {
        method: 'get',
      });
    });
  });

  describe('custom Ky options', () => {
    it('passes custom headers through options', async () => {
      await client.Api.Pets.getPet({
        path: { petId: 123 },
        kyOptions: {
          headers: {
            Authorization: 'Bearer token123',
            'X-Custom-Header': 'custom-value',
          },
        },
      });

      expect(mockKy).toHaveBeenCalledWith('/pets/123', {
        method: 'get',
        headers: {
          Authorization: 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
      });
    });

    it('passes timeout and retry options', async () => {
      await client.Api.Pets.getPets({
        query: { limit: 10 },
        kyOptions: {
          timeout: 5000,
          retry: 3,
        },
      });

      const expectedSearchParams = new URLSearchParams();
      expectedSearchParams.append('limit', '10');

      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'get',
        searchParams: expectedSearchParams,
        timeout: 5000,
        retry: 3,
      });
    });

    it('combines body data with custom options for POST requests', async () => {
      const petData = {
        name: 'Buddy',
        breed: 'Golden Retriever',
      };

      await client.Api.Pets.createPet({
        body: petData,
        kyOptions: {
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': 'req-123',
          },
          timeout: 10000,
        },
      });

      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'post',
        json: petData,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': 'req-123',
        },
        timeout: 10000,
      });
    });

    it('handles complex combinations of path, query, body, and options', async () => {
      // Create a complex endpoint for this test
      const complexSpec = {
        'Api.Orders.updateOrder': {
          operationId: 'updateOrder',
          method: 'PUT',
          path: '/orders/{orderId}',
        },
      };

      type ComplexOrderSpec = {
        Api: {
          Orders: {
            updateOrder: {
              request: {
                parameters: {
                  path: { orderId: string };
                  query?: { notify?: boolean };
                };
                body: { status: string; notes?: string };
              };
              response: {
                statusCode: 200;
                contentType: 'application/json';
                content: { orderId: string; status: string };
              };
            };
          };
        };
      };

      const complexClient = createClient<ComplexOrderSpec>(mockKy, complexSpec);

      await complexClient.Api.Orders.updateOrder({
        path: { orderId: 'order-456' },
        query: { notify: true },
        body: { status: 'shipped', notes: 'Package sent via FedEx' },
        kyOptions: {
          headers: {
            Authorization: 'Bearer admin-token',
            'X-Idempotency-Key': 'update-456-v2',
          },
          timeout: 15000,
          retry: { limit: 2 },
        },
      });

      const expectedSearchParams = new URLSearchParams();
      expectedSearchParams.append('notify', 'true');

      expect(mockKy).toHaveBeenCalledWith('/orders/order-456', {
        method: 'put',
        searchParams: expectedSearchParams,
        json: { status: 'shipped', notes: 'Package sent via FedEx' },
        headers: {
          Authorization: 'Bearer admin-token',
          'X-Idempotency-Key': 'update-456-v2',
        },
        timeout: 15000,
        retry: { limit: 2 },
      });
    });

    it('options parameter is optional and works without it', async () => {
      // Ensure backwards compatibility - options should be optional
      await client.Api.Pets.getPet({ path: { petId: 123 } });

      expect(mockKy).toHaveBeenCalledWith('/pets/123', {
        method: 'get',
      });
    });

    it('prevents overriding reserved options (method, json, searchParams)', async () => {
      // The type system should prevent this, but test runtime behavior
      const petData = { name: 'Test', breed: 'Test' };

      await client.Api.Pets.createPet({
        body: petData,
        kyOptions: {
          // These should be ignored/overridden by the client
          headers: { 'X-Custom': 'value' },
          timeout: 5000,
        } as any, // Using 'as any' to bypass type checking for this test
      });

      // Should still use the correct method and json, but include custom options
      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'post',
        json: petData,
        headers: { 'X-Custom': 'value' },
        timeout: 5000,
      });
    });
  });

  describe('OpenAPI string status codes', () => {
    it('handles default status code', async () => {
      const stringStatusSpec = {
        'Api.Health.check': {
          operationId: 'healthCheck',
          method: 'GET',
          path: '/health',
          statusCodes: ['default'],
        },
      };

      type StringStatusSpec = {
        Api: {
          Health: {
            check: {
              request: {};
              response: {
                statusCode: 'default';
                contentType: 'application/json';
                content: { status: string };
              };
            };
          };
        };
      };

      const stringStatusClient = createClient<StringStatusSpec>(
        mockKy,
        stringStatusSpec,
      );
      const result = await stringStatusClient.Api.Health.check({});

      // The status should be "default" since that's what the spec defines
      expect(result.status).toBe('default');
      expect(result.data).toEqual({
        id: 1,
        name: 'Fluffy',
        breed: 'Golden Retriever',
      });
    });

    it('handles 4XX pattern status code', async () => {
      const patternStatusSpec = {
        'Api.Errors.clientError': {
          operationId: 'clientError',
          method: 'GET',
          path: '/client-error',
          statusCodes: ['4XX'],
        },
      };

      type PatternStatusSpec = {
        Api: {
          Errors: {
            clientError: {
              request: {};
              response: {
                statusCode: '4XX';
                contentType: 'application/json';
                content: { error: string };
              };
            };
          };
        };
      };

      // Mock a 400 response
      const errorResponse = {
        json: vi.fn().mockResolvedValue({ error: 'Bad Request' }),
        status: 400,
        statusText: 'Bad Request',
        ok: false,
        headers: new Headers(),
        url: 'https://api.example.com/client-error',
      };

      const patternMockKy = vi
        .fn()
        .mockResolvedValue(errorResponse) as unknown as KyInstance;
      const patternClient = createClient<PatternStatusSpec>(
        patternMockKy,
        patternStatusSpec,
      );

      const result = await patternClient.Api.Errors.clientError({});

      // The status should be "4XX" since that's what the spec defines
      expect(result.status).toBe('4XX');
      expect(result.data).toEqual({ error: 'Bad Request' });
    });

    it('handles mixed literal and string status codes', async () => {
      const mixedStatusSpec = {
        'Api.Mixed.endpoint': {
          operationId: 'mixedEndpoint',
          method: 'POST',
          path: '/mixed',
          statusCodes: [201, '4XX', 'default'],
        },
      };

      type MixedStatusSpec = {
        Api: {
          Mixed: {
            endpoint: {
              request: {
                body: { data: string };
              };
              response:
                | {
                    statusCode: 201;
                    contentType: 'application/json';
                    content: { id: string };
                  }
                | {
                    statusCode: '4XX';
                    contentType: 'application/json';
                    content: { error: string };
                  }
                | {
                    statusCode: 'default';
                    contentType: 'application/json';
                    content: { message: string };
                  };
            };
          };
        };
      };

      const mixedClient = createClient<MixedStatusSpec>(
        mockKy,
        mixedStatusSpec,
      );
      const result = await mixedClient.Api.Mixed.endpoint({
        body: { data: 'test' },
      });

      // Since HTTP response is 200, and no exact match exists, should fallback to default
      expect(result.status).toBe('default');
    });

    it('handles exact status code matches correctly', async () => {
      const exactMatchSpec = {
        'Api.Users.getUser': {
          operationId: 'getUser',
          method: 'GET',
          path: '/users/{id}',
          statusCodes: [200, 404, '5XX'],
        },
      };

      type ExactMatchSpec = {
        Api: {
          Users: {
            getUser: {
              request: {
                parameters: {
                  path: { id: string };
                };
              };
              response:
                | {
                    statusCode: 200;
                    contentType: 'application/json';
                    content: { id: string; name: string };
                  }
                | {
                    statusCode: 404;
                    contentType: 'application/json';
                    content: { error: string };
                  }
                | {
                    statusCode: '5XX';
                    contentType: 'application/json';
                    content: { error: string; trace: string };
                  };
            };
          };
        };
      };

      const exactMatchClient = createClient<ExactMatchSpec>(
        mockKy,
        exactMatchSpec,
      );
      const result = await exactMatchClient.Api.Users.getUser({
        path: { id: 'user-123' },
      });

      // Since mock returns 200, should get exact match
      expect(result.status).toBe(200);
      expect(result.response.status).toBe(200);
    });
  });

  describe('content type handling', () => {
    it('handles different content types appropriately', async () => {
      // Default to JSON when no contentType specified
      const petData = { name: 'Buddy', breed: 'Golden Retriever' };
      await client.Api.Pets.createPet({ body: petData });
      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'post',
        json: petData,
      });

      // Form URL encoded
      const formSpec = {
        'Api.Forms.submit': {
          operationId: 'submitForm',
          method: 'POST',
          path: '/forms',
          contentType: 'application/x-www-form-urlencoded',
        },
      };
      type FormSpec = {
        Api: {
          Forms: {
            submit: {
              request: { body: Record<string, string> };
              response: {
                statusCode: 200;
                contentType: 'application/json';
                content: { success: boolean };
              };
            };
          };
        };
      };
      const formClient = createClient<FormSpec>(mockKy, formSpec);
      const formData = { name: 'John', email: 'john@example.com' };
      await formClient.Api.Forms.submit({ body: formData });
      expect(mockKy).toHaveBeenCalledWith('/forms', {
        method: 'post',
        body: new URLSearchParams(formData),
      });

      // Multipart form data
      const uploadSpec = {
        'Api.Files.upload': {
          operationId: 'uploadFile',
          method: 'POST',
          path: '/files',
          contentType: 'multipart/form-data',
        },
      };
      type UploadSpec = {
        Api: {
          Files: {
            upload: {
              request: { body: FormData };
              response: {
                statusCode: 200;
                contentType: 'application/json';
                content: { fileId: string };
              };
            };
          };
        };
      };
      const uploadClient = createClient<UploadSpec>(mockKy, uploadSpec);
      const multipartData = new FormData();
      multipartData.append('file', new Blob(['test']), 'test.txt');
      await uploadClient.Api.Files.upload({ body: multipartData });
      expect(mockKy).toHaveBeenCalledWith('/files', {
        method: 'post',
        body: multipartData,
      });

      // Text plain
      const textSpec = {
        'Api.Text.create': {
          operationId: 'createText',
          method: 'POST',
          path: '/text',
          contentType: 'text/plain',
        },
      };
      type TextSpec = {
        Api: {
          Text: {
            create: {
              request: { body: string };
              response: {
                statusCode: 200;
                contentType: 'application/json';
                content: { id: string };
              };
            };
          };
        };
      };
      const textClient = createClient<TextSpec>(mockKy, textSpec);
      await textClient.Api.Text.create({ body: 'Plain text content' });
      expect(mockKy).toHaveBeenCalledWith('/text', {
        method: 'post',
        body: 'Plain text content',
      });

      // Custom content type (passes through as-is)
      const customSpec = {
        'Api.Custom.send': {
          operationId: 'sendCustom',
          method: 'POST',
          path: '/custom',
          contentType: 'application/custom',
        },
      };
      type CustomSpec = {
        Api: {
          Custom: {
            send: {
              request: { body: unknown };
              response: {
                statusCode: 200;
                contentType: 'application/json';
                content: { received: boolean };
              };
            };
          };
        };
      };
      const customClient = createClient<CustomSpec>(mockKy, customSpec);
      const customData = new Uint8Array([1, 2, 3, 4]);
      await customClient.Api.Custom.send({ body: customData });
      expect(mockKy).toHaveBeenCalledWith('/custom', {
        method: 'post',
        body: customData,
      });
    });
  });

  describe('search parameter override behavior', () => {
    it('uses options.searchParams to fully override query parameters', async () => {
      const customSearchParams = new URLSearchParams();
      customSearchParams.append('apiKey', 'abc123');
      customSearchParams.append('custom', 'value');

      await client.Api.Pets.getPets({
        query: { limit: 10, offset: 5 }, // This will be ignored when searchParams is provided
        kyOptions: {
          searchParams: customSearchParams,
        },
      });

      expect(mockKy).toHaveBeenCalledWith('/pets', {
        method: 'get',
        searchParams: customSearchParams,
      });
    });
  });
});
