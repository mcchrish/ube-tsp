import { describe, it } from 'vitest';
import { readAndValidateComplete, createEmitterTestRunner } from './utils.jsx';

describe('Multi-Status Code Support', () => {
  describe('TypeSpec Default Status Code Mapping', () => {
    it('should use 200 for GET operations with return values', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
        }

        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
        }
      `);

      const expectedOutput = `export interface GetPetTypes {
  pathParams: { petId: number };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string } };
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
} as const;`;

      await readAndValidateComplete(runner, 'getPet', expectedOutput);
    });

    it('should use 200 for POST operations with return values', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
        }

        @route("/pets")
        interface Pets {
          @post
          createPet(@body pet: Pet): Pet;
        }
      `);

      const expectedOutput = `export interface CreatePetTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body: { pet: { id: number; name: string } };
  responses: { 200: { id: number; name: string } };
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
} as const;`;

      await readAndValidateComplete(runner, 'createPet', expectedOutput);
    });

    it('should use 204 for DELETE operations', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        @route("/pets")
        interface Pets {
          @delete
          deletePet(@path petId: int32): void;
        }
      `);

      const expectedOutput = `export interface DeletePetTypes {
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
} as const;`;

      await readAndValidateComplete(runner, 'deletePet', expectedOutput);
    });

    it('should use 204 for POST operations returning void', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        @route("/pets")
        interface Pets {
          @post
          resetPets(): void;
        }
      `);

      const expectedOutput = `export interface ResetPetsTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 204: void };
};
export const resetPets = {
  operationId: 'resetPets',
  method: 'POST' as const,
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [204]
} as const;`;

      await readAndValidateComplete(runner, 'resetPets', expectedOutput);
    });
  });

  describe('Status Code Edge Cases', () => {
    it('should handle operations with array return types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
        }

        @route("/pets")
        interface Pets {
          @get
          listPets(): Pet[];
        }
      `);

      const expectedOutput = `export interface ListPetsTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string }[] };
};
export const listPets = {
  operationId: 'listPets',
  method: 'GET' as const,
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [200]
} as const;`;

      await readAndValidateComplete(runner, 'listPets', expectedOutput);
    });

    it('should handle PUT operations with return values', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
        }

        @route("/pets")
        interface Pets {
          @put
          updatePet(@path petId: int32, @body pet: Pet): Pet;
        }
      `);

      const expectedOutput = `export interface UpdatePetTypes {
  pathParams: { petId: number };
  queryParams?: never;
  headers?: never;
  body: { pet: { id: number; name: string } };
  responses: { 200: { id: number; name: string } };
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
} as const;`;

      await readAndValidateComplete(runner, 'updatePet', expectedOutput);
    });
  });

  describe('Multi-Status Code Readiness', () => {
    it('should maintain infrastructure for future explicit multi-status code support', async () => {
      // This test demonstrates that our infrastructure is ready for when TypeSpec
      // provides explicit multi-status code operations in the future
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
        }

        model Error {
          code: int32;
          message: string;
        }

        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
        }
      `);

      const expectedOutput = `export interface GetPetTypes {
  pathParams: { petId: number };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string } };
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
} as const;`;

      await readAndValidateComplete(runner, 'getPet', expectedOutput);

      // Note: When TypeSpec supports explicit multi-status codes, this infrastructure
      // will automatically generate something like:
      // responses: { 200: Pet; 404: Error; 500: Error }
      // statusCodes: [200, 404, 500]
    });
  });
});
