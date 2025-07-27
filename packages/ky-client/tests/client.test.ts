import type { KyInstance, KyResponse, Options } from "ky";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "../src/client.js";

// Simple test operation map
const testOperationMap = {
  "Api.Pets.getPet": {
    operationId: "getPet",
    method: "GET",
    path: "/pets/{petId}",
    statusCodes: [200],
    contentTypes: [],
  },
  "Api.Pets.listPets": {
    operationId: "listPets",
    method: "GET",
    path: "/pets",
    statusCodes: [200],
    contentTypes: [],
  },
  "Api.Pets.createPet": {
    operationId: "createPet",
    method: "POST",
    path: "/pets",
    statusCodes: [201],
    contentTypes: [],
  },
  "simple": {
    operationId: "simple",
    method: "GET",
    path: "/simple",
    statusCodes: [200],
    contentTypes: [],
  },
  "Api.V1.Users.getUser": {
    operationId: "getUser",
    method: "GET",
    path: "/users/{userId}",
    statusCodes: [200],
    contentTypes: [],
  },
};

// Test client type - what the generator would create
type TestClient = {
  Api: {
    Pets: {
      getPet: (params: unknown, kyOptions?: Options) => Promise<unknown>;
      listPets: (params?: unknown, kyOptions?: Options) => Promise<unknown>;
      createPet: (params: unknown, kyOptions?: Options) => Promise<unknown>;
    };
    V1: {
      Users: {
        getUser: (params: unknown, kyOptions?: Options) => Promise<unknown>;
      };
    };
  };
  simple: (params?: unknown, kyOptions?: Options) => Promise<unknown>;
};

// Mock Ky setup
const createMockKy = () => {
  const headers = new Headers();
  headers.set("content-type", "application/json");

  const mockResponse = {
    json: vi.fn().mockResolvedValue({ id: 1, name: "Fluffy" }),
    status: 200,
    statusText: "OK",
    ok: true,
    headers,
    url: "https://api.example.com/test",
  } as unknown as KyResponse;

  const mockKy = vi.fn().mockResolvedValue(mockResponse) as unknown as KyInstance;
  return { mockKy, mockResponse };
};

describe("createClient", () => {
  let mockKy: KyInstance;
  let mockResponse: KyResponse;
  let client: TestClient;

  beforeEach(() => {
    const mocks = createMockKy();
    mockKy = mocks.mockKy;
    mockResponse = mocks.mockResponse;
    client = createClient<TestClient>(mockKy, testOperationMap);
  });

  describe("client structure creation", () => {
    it("creates nested object structure from dotted operation keys", () => {
      expect(client.Api).toBeDefined();
      expect(client.Api.Pets).toBeDefined();
      expect(client.Api.V1).toBeDefined();
      expect(client.Api.V1.Users).toBeDefined();
    });

    it("creates functions at leaf nodes", () => {
      expect(typeof client.Api.Pets.getPet).toBe("function");
      expect(typeof client.Api.Pets.listPets).toBe("function");
      expect(typeof client.Api.Pets.createPet).toBe("function");
      expect(typeof client.Api.V1.Users.getUser).toBe("function");
      expect(typeof client.simple).toBe("function");
    });

    it("handles mixed nesting depths", () => {
      // Top level function
      expect(typeof client.simple).toBe("function");
      // 3-level nesting
      expect(typeof client.Api.Pets.getPet).toBe("function");
      // 4-level nesting
      expect(typeof client.Api.V1.Users.getUser).toBe("function");
    });
  });

  describe("request integration", () => {
    it("integrates path parameters with method and URL", async () => {
      await client.Api.Pets.getPet({
        params: { path: { petId: 123 } },
      });

      expect(mockKy).toHaveBeenCalledWith("pets/123", {
        method: "get",
      });
    });

    it("integrates query parameters with other options", async () => {
      await client.Api.Pets.listPets({
        params: { query: { limit: 10, tags: ["red", "blue"] } },
      });

      const expectedSearchParams = new URLSearchParams();
      expectedSearchParams.append("limit", "10");
      expectedSearchParams.append("tags", "red");
      expectedSearchParams.append("tags", "blue");

      expect(mockKy).toHaveBeenCalledWith("pets", {
        method: "get",
        searchParams: expectedSearchParams,
      });
    });

    it("integrates headers with request", async () => {
      await client.Api.Pets.getPet({
        params: {
          path: { petId: 123 },
          header: { "Authorization": "Bearer token", "X-API-Key": "key123" },
        },
      });

      expect(mockKy).toHaveBeenCalledWith("pets/123", {
        method: "get",
        headers: {
          "Authorization": "Bearer token",
          "X-API-Key": "key123",
        },
      });
    });

    it("integrates request body with POST methods", async () => {
      const petData = { name: "Buddy", breed: "Golden Retriever" };

      await client.Api.Pets.createPet({ body: petData });

      expect(mockKy).toHaveBeenCalledWith("pets", {
        method: "post",
        body: '{"name":"Buddy","breed":"Golden Retriever"}',
      });
    });

    it("integrates kyOptions parameter with generated options", async () => {
      await client.Api.Pets.getPet(
        { params: { path: { petId: 123 } } },
        {
          timeout: 5000,
          headers: { "X-Custom": "value" },
          retry: 3,
        },
      );

      expect(mockKy).toHaveBeenCalledWith("pets/123", {
        method: "get",
        timeout: 5000,
        headers: { "X-Custom": "value" },
        retry: 3,
      });
    });

    it("merges headers from params and kyOptions correctly", async () => {
      await client.Api.Pets.getPet(
        {
          params: {
            path: { petId: 123 },
            header: { "Authorization": "Bearer token", "X-Client": "test" },
          },
        },
        {
          headers: { "X-Request-ID": "req-456", "X-Custom": "value" },
        },
      );

      expect(mockKy).toHaveBeenCalledWith("pets/123", {
        method: "get",
        headers: {
          "X-Request-ID": "req-456",
          "X-Custom": "value",
          "Authorization": "Bearer token",
          "X-Client": "test",
        },
      });
    });

    it("kyOptions headers override params headers when keys conflict", async () => {
      await client.Api.Pets.getPet(
        {
          params: {
            path: { petId: 123 },
            header: { "Authorization": "Bearer old-token", "X-Client": "test" },
          },
        },
        {
          headers: {
            "Authorization": "Bearer new-token",
            "X-Request-ID": "req-456",
          },
        },
      );

      expect(mockKy).toHaveBeenCalledWith("pets/123", {
        method: "get",
        headers: {
          "Authorization": "Bearer new-token", // kyOptions takes precedence
          "X-Request-ID": "req-456",
          "X-Client": "test",
        },
      });
    });

    it("kyOptions searchParams completely overrides params query", async () => {
      const customSearchParams = new URLSearchParams();
      customSearchParams.append("apiKey", "abc123");
      customSearchParams.append("version", "v2");

      await client.Api.Pets.listPets(
        {
          params: {
            query: { limit: 10, offset: 5, filter: "active" }, // This will be ignored
          },
        },
        {
          searchParams: customSearchParams, // This takes complete precedence
        },
      );

      expect(mockKy).toHaveBeenCalledWith("pets", {
        method: "get",
        searchParams: customSearchParams, // Only the kyOptions searchParams are used
      });
    });

    it("integrates all parameter types together", async () => {
      await client.Api.V1.Users.getUser(
        {
          params: {
            path: { userId: "user123" },
            query: { include: ["profile", "settings"] },
            header: { Authorization: "Bearer token" },
          },
        },
        {
          timeout: 10000,
          headers: { "X-Request-ID": "req456" },
        },
      );

      const expectedSearchParams = new URLSearchParams();
      expectedSearchParams.append("include", "profile");
      expectedSearchParams.append("include", "settings");

      expect(mockKy).toHaveBeenCalledWith("users/user123", {
        method: "get",
        searchParams: expectedSearchParams,
        timeout: 10000,
        headers: {
          "X-Request-ID": "req456",
          "Authorization": "Bearer token",
        },
      });
    });
  });

  describe("response integration", () => {
    it("transforms ky response into structured API response", async () => {
      const result = await client.Api.Pets.getPet({
        params: { path: { petId: 1 } },
      });

      expect(result).toHaveProperty("response");
      expect(result).toHaveProperty("kyResponse");

      // Check nested response structure
      expect(result).toMatchObject({
        response: {
          statusCode: 200,
          contentType: "application/json",
          content: {
            id: 1,
            name: "Fluffy",
          },
        },
      });

      // Check kyResponse is passed through
      expect(result).toHaveProperty("kyResponse", mockResponse);
    });

    it("handles different status codes through response resolution", async () => {
      // Mock a 404 response
      const notFoundResponse = {
        ...mockResponse,
        status: 404,
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Not Found" }),
      };

      const notFoundKy = vi.fn().mockResolvedValue(notFoundResponse) as unknown as KyInstance;
      const notFoundClient = createClient<TestClient>(notFoundKy, testOperationMap);

      const result = await notFoundClient.Api.Pets.getPet({
        params: { path: { petId: 999 } },
      });

      expect(result).toMatchObject({
        response: {
          statusCode: 404,
          content: {
            error: "Not Found",
          },
        },
        kyResponse: {
          ok: false,
        },
      });
    });

    it("maps content-type header from ky response to response.contentType", async () => {
      // Test different content types
      const textHeaders = new Headers();
      textHeaders.set("content-type", "text/plain; charset=utf-8");

      const textResponse = {
        ...mockResponse,
        headers: textHeaders,
        json: vi.fn().mockResolvedValue("plain text content"),
      };

      const textKy = vi.fn().mockResolvedValue(textResponse) as unknown as KyInstance;
      const textClient = createClient<TestClient>(textKy, testOperationMap);

      const result = await textClient.Api.Pets.getPet({
        params: { path: { petId: 1 } },
      });

      expect(result).toMatchObject({
        response: {
          contentType: "text/plain; charset=utf-8",
        },
      });
    });

    it("handles missing content-type header", async () => {
      const noContentTypeHeaders = new Headers();
      // Deliberately not setting content-type

      const noContentTypeResponse = {
        ...mockResponse,
        headers: noContentTypeHeaders,
        json: vi.fn().mockResolvedValue({ data: "test" }),
      };

      const noContentTypeKy = vi.fn().mockResolvedValue(noContentTypeResponse) as unknown as KyInstance;
      const noContentTypeClient = createClient<TestClient>(noContentTypeKy, testOperationMap);

      const result = await noContentTypeClient.Api.Pets.getPet({
        params: { path: { petId: 1 } },
      });

      expect(result).not.toHaveProperty("response.contentType");
    });

    it("preserves exact content-type value including parameters", async () => {
      const xmlHeaders = new Headers();
      xmlHeaders.set("content-type", "application/xml; charset=iso-8859-1; boundary=something");

      const xmlResponse = {
        ...mockResponse,
        headers: xmlHeaders,
        json: vi.fn().mockResolvedValue("<xml>data</xml>"),
      };

      const xmlKy = vi.fn().mockResolvedValue(xmlResponse) as unknown as KyInstance;
      const xmlClient = createClient<TestClient>(xmlKy, testOperationMap);

      const result = await xmlClient.Api.Pets.getPet({
        params: { path: { petId: 1 } },
      });

      expect(result).toMatchObject({
        response: {
          contentType: "application/xml; charset=iso-8859-1; boundary=something",
        },
      });
    });
  });

  describe("error handling", () => {
    it("handles ky request failures", async () => {
      const errorKy = vi.fn().mockRejectedValue(new Error("Network error")) as unknown as KyInstance;
      const errorClient = createClient<TestClient>(errorKy, testOperationMap);

      await expect(
        errorClient.Api.Pets.getPet({
          params: { path: { petId: 123 } },
        }),
      ).rejects.toThrow("Network error");
    });
  });
});
