import { describe, it } from 'vitest';
import { 
  readAndValidateComplete,
  createEmitterTestRunner,
} from './utils.jsx';
import { EXPECTED_OPERATIONS } from './expected-operations.js';

describe('Full Emitter Integration', () => {
  describe('Complete Pets API', () => {
    it('should generate all Pets API operations exactly as expected', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model CreatePetRequest {
          name: string;
          tag?: string;
        }

        model Pet {
          id: int32;
          name: string;
          tag?: string;
          status: "available" | "pending" | "sold";
        }

        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
          
          @post
          createPet(@body pet: CreatePetRequest): Pet;
          
          @put
          updatePet(@path petId: int32, @body pet: Pet): Pet;
          
          @delete
          deletePet(@path petId: int32): void;
          
          @get
          listPets(@query status?: string, @query limit?: int32): Pet[];
        }
      `);

      // Validate each complete operation file matches exactly
      await readAndValidateComplete(runner, 'createPet', EXPECTED_OPERATIONS.createPet);
      await readAndValidateComplete(runner, 'getPet', EXPECTED_OPERATIONS.getPet);
      await readAndValidateComplete(runner, 'updatePet', EXPECTED_OPERATIONS.updatePet);
      await readAndValidateComplete(runner, 'deletePet', EXPECTED_OPERATIONS.deletePet);
      await readAndValidateComplete(runner, 'listPets', EXPECTED_OPERATIONS.listPets);
    });

    it('should generate search operations with complex parameters', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
          tag?: string;
          status: "available" | "pending" | "sold";
        }

        @route("/pets/search")
        interface PetSearch {
          @get
          searchPets(
            @query q: string,
            @query category?: string,
            @header authorization: string
          ): Pet[];
        }
      `);

      await readAndValidateComplete(runner, 'searchPets', EXPECTED_OPERATIONS.searchPets);
    });
  });

  describe('Mixed API Scenarios', () => {
    it('should handle operations with nested models correctly', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Address {
          street: string;
          city: string;
          zipCode?: string;
        }

        model Owner {
          name: string;
          email: string;
          address: Address;
        }

        model PetWithOwner {
          id: int32;
          name: string;
          owner: Owner;
          status: "available" | "pending" | "sold";
        }

        @route("/pets")
        interface Pets {
          @post
          createPetWithOwner(@body petData: PetWithOwner): PetWithOwner;
        }
      `);

      // Should generate flattened nested structure
      const expectedOutput = `export interface CreatePetWithOwnerTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body: { petData: { id: number; name: string; owner: { name: string; email: string; address: { street: string; city: string; zipCode?: string } }; status: "available" | "pending" | "sold" } };
  responses: { 200: { id: number; name: string; owner: { name: string; email: string; address: { street: string; city: string; zipCode?: string } }; status: "available" | "pending" | "sold" } };
};
export const createPetWithOwner = {
  operationId: 'createPetWithOwner',
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

      await readAndValidateComplete(runner, 'createPetWithOwner', expectedOutput);
    });

    it('should handle void operations correctly', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        @route("/pets")
        interface Pets {
          @delete
          deletePet(@path petId: int32): void;
          
          @post
          resetPets(): void;
        }
      `);

      await readAndValidateComplete(runner, 'deletePet', EXPECTED_OPERATIONS.deletePet);

      const expectedResetPets = `export interface ResetPetsTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 200: void };
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
  statusCodes: [200]
} as const;`;

      await readAndValidateComplete(runner, 'resetPets', expectedResetPets);
    });

    it('should handle array return types correctly', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
          tag?: string;
          status: "available" | "pending" | "sold";
        }

        @route("/pets")
        interface Pets {
          @get
          listPets(@query status?: string, @query limit?: int32): Pet[];
        }
        
        @route("/pets/all")
        interface AllPets {
          @get
          getAllPets(): Pet[];
        }
      `);

      await readAndValidateComplete(runner, 'listPets', EXPECTED_OPERATIONS.listPets);

      const expectedGetAllPets = `export interface GetAllPetsTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" }[] };
};
export const getAllPets = {
  operationId: 'getAllPets',
  method: 'GET' as const,
  path: '/pets/all',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [200]
} as const;`;

      await readAndValidateComplete(runner, 'getAllPets', expectedGetAllPets);
    });
  });

  describe('Edge Cases', () => {
    it('should handle operations with only optional parameters', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
          tag?: string;
          status: "available" | "pending" | "sold";
        }

        @route("/pets")
        interface Pets {
          @get
          searchPets(@query name?: string, @query status?: string): Pet[];
        }
      `);

      const expectedOutput = `export interface SearchPetsTypes {
  pathParams?: never;
  queryParams: { name?: string; status?: string };
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" }[] };
};
export const searchPets = {
  operationId: 'searchPets',
  method: 'GET' as const,
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [200]
} as const;`;

      await readAndValidateComplete(runner, 'searchPets', expectedOutput);
    });

    it('should handle operations with complex union types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
          type: "dog" | "cat" | "bird" | "fish";
          status: "available" | "pending" | "sold";
        }

        @route("/pets")
        interface Pets {
          @get
          getPetsByType(@query petType: "dog" | "cat" | "bird"): Pet[];
        }
      `);

      const expectedOutput = `export interface GetPetsByTypeTypes {
  pathParams?: never;
  queryParams: { petType: "dog" | "cat" | "bird" };
  headers?: never;
  body?: never;
  responses: { 200: { id: number; name: string; type: "dog" | "cat" | "bird" | "fish"; status: "available" | "pending" | "sold" }[] };
};
export const getPetsByType = {
  operationId: 'getPetsByType',
  method: 'GET' as const,
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: false,
    hasBody: false
  },
  statusCodes: [200]
} as const;`;

      await readAndValidateComplete(runner, 'getPetsByType', expectedOutput);
    });
  });
});