/**
 * Hand-written expected outputs for operation files
 * These represent exactly what our emitter should generate
 */

export const EXPECTED_OPERATIONS = {
  createPet: `export interface CreatePetTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body: { pet: { name: string; tag?: string } };
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } };
};
export const createPet = {
  operationId: 'createPet',
  method: 'POST' as const,
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  },
  statusCodes: [200]
} as const;`,

  getPet: `export interface GetPetTypes {
  pathParams: { petId: number };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } };
};
export const getPet = {
  operationId: 'getPet',
  method: 'GET' as const,
  path: '/pets/{petId}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [200]
} as const;`,

  updatePet: `export interface UpdatePetTypes {
  pathParams: { petId: number };
  queryParams?: never;
  headers?: never;
  body: { pet: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } };
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } };
};
export const updatePet = {
  operationId: 'updatePet',
  method: 'PUT' as const,
  path: '/pets/{petId}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  },
  statusCodes: [200]
} as const;`,

  deletePet: `export interface DeletePetTypes {
  pathParams: { petId: number };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 204: void };
};
export const deletePet = {
  operationId: 'deletePet',
  method: 'DELETE' as const,
  path: '/pets/{petId}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [204]
} as const;`,

  listPets: `export interface ListPetsTypes {
  pathParams?: never;
  queryParams: { status?: string; limit?: number };
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" }[] };
};
export const listPets = {
  operationId: 'listPets',
  method: 'GET' as const,
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [200]
} as const;`,

  searchPets: `export interface SearchPetsTypes {
  pathParams?: never;
  queryParams: { q: string; category?: string };
  headers: { authorization: string };
  body?: never;
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" }[] };
};
export const searchPets = {
  operationId: 'searchPets',
  method: 'GET' as const,
  path: '/pets/search',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: true,
    hasBody: false
  },
  statusCodes: [200]
} as const;`,
};

/**
 * Expected sections for partial validation
 */
export const EXPECTED_SECTIONS = {
  createPetInterface: `export interface CreatePetTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body: { pet: { name: string; tag?: string } };
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } };
};`,

  createPetConfig: `export const createPet = {
  operationId: 'createPet',
  method: 'POST' as const,
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  },
  statusCodes: [200]
} as const;`,

  getPetInterface: `export interface GetPetTypes {
  pathParams: { petId: number };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } };
};`,

  parameterTypesWithBody: `parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }`,

  parameterTypesWithPath: `parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }`,

  parameterTypesWithQuery: `parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: false,
    hasBody: false
  }`,

  parameterTypesWithPathAndBody: `parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }`,

  neverParameters: `pathParams?: never;
  queryParams?: never;
  headers?: never;
  body?: never;`,

  pathParameters: `pathParams: { petId: number };`,

  queryParameters: `queryParams: { status?: string; limit?: number };`,

  bodyParameters: `body: { pet: { name: string; tag?: string } };`,

  responseTypes: `responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } };`,

  arrayResponseTypes: `responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" }[] };`,

  voidResponseTypes: `responses: { 204: void };`,
};
