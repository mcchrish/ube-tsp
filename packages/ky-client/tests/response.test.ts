import type { KyResponse } from "ky";
import { describe, expect, it } from "vitest";
import { resolveResponseStatus } from "../src//utils/response.js";

describe("resolveResponseStatus", () => {
  const createMockResponse = (status: number): KyResponse =>
    ({
      status,
    }) as KyResponse;

  it("should return response status when no status codes provided", () => {
    const response = createMockResponse(200);
    expect(resolveResponseStatus(response)).toBe(200);
  });

  it("should return response status when status is in allowed list", () => {
    const response = createMockResponse(200);
    expect(resolveResponseStatus(response, [200, 404])).toBe(200);
  });

  it("should return response status when status is not in allowed list", () => {
    const response = createMockResponse(500);
    expect(resolveResponseStatus(response, [200, 404])).toBe(500);
  });

  it("should return '2XX' for 2xx status codes", () => {
    expect(resolveResponseStatus(createMockResponse(200), ["2XX"])).toBe("2XX");
    expect(resolveResponseStatus(createMockResponse(201), ["2XX"])).toBe("2XX");
    expect(resolveResponseStatus(createMockResponse(299), ["2XX"])).toBe("2XX");
  });

  it("should return '3XX' for 3xx status codes", () => {
    expect(resolveResponseStatus(createMockResponse(300), ["3XX"])).toBe("3XX");
    expect(resolveResponseStatus(createMockResponse(301), ["3XX"])).toBe("3XX");
    expect(resolveResponseStatus(createMockResponse(399), ["3XX"])).toBe("3XX");
  });

  it("should return '4XX' for 4xx status codes", () => {
    expect(resolveResponseStatus(createMockResponse(400), ["4XX"])).toBe("4XX");
    expect(resolveResponseStatus(createMockResponse(404), ["4XX"])).toBe("4XX");
    expect(resolveResponseStatus(createMockResponse(499), ["4XX"])).toBe("4XX");
  });

  it("should return '5XX' for 5xx status codes", () => {
    expect(resolveResponseStatus(createMockResponse(500), ["5XX"])).toBe("5XX");
    expect(resolveResponseStatus(createMockResponse(502), ["5XX"])).toBe("5XX");
    expect(resolveResponseStatus(createMockResponse(599), ["5XX"])).toBe("5XX");
  });

  it("should return 'default' for any status code", () => {
    expect(resolveResponseStatus(createMockResponse(200), ["default"])).toBe("default");
    expect(resolveResponseStatus(createMockResponse(404), ["default"])).toBe("default");
    expect(resolveResponseStatus(createMockResponse(500), ["default"])).toBe("default");
  });

  it("should return first matching pattern", () => {
    expect(resolveResponseStatus(createMockResponse(200), ["2XX", "default"])).toBe("2XX");
    expect(resolveResponseStatus(createMockResponse(404), ["4XX", "default"])).toBe("4XX");
  });

  it("should prioritize exact status codes over patterns", () => {
    expect(resolveResponseStatus(createMockResponse(200), [200, "2XX"])).toBe(200);
    expect(resolveResponseStatus(createMockResponse(404), [404, "4XX"])).toBe(404);
  });

  it("should return actual status when no patterns match", () => {
    expect(resolveResponseStatus(createMockResponse(200), ["4XX", "5XX"])).toBe(200);
    expect(resolveResponseStatus(createMockResponse(404), ["2XX", "5XX"])).toBe(404);
  });

  it("should handle mixed status codes and patterns", () => {
    const statusCodes = [200, "4XX", 500, "default"];

    expect(resolveResponseStatus(createMockResponse(200), statusCodes)).toBe(200);
    expect(resolveResponseStatus(createMockResponse(404), statusCodes)).toBe("4XX");
    expect(resolveResponseStatus(createMockResponse(500), statusCodes)).toBe(500);
    expect(resolveResponseStatus(createMockResponse(300), statusCodes)).toBe("default");
  });

  it("should handle edge cases for status code ranges", () => {
    expect(resolveResponseStatus(createMockResponse(199), ["2XX"])).toBe(199);
    expect(resolveResponseStatus(createMockResponse(300), ["2XX"])).toBe(300);
    expect(resolveResponseStatus(createMockResponse(299), ["3XX"])).toBe(299);
    expect(resolveResponseStatus(createMockResponse(400), ["3XX"])).toBe(400);
  });
});
