import { describe, it } from 'vitest';
import { readAndValidateComplete, createEmitterTestRunner } from './utils.jsx';

describe('Operation Generation', () => {
  describe('HTTP Methods', () => {
    it('should generate GET operation with path parameters', async () => {
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
          getPet(@path petId: int32): Pet;
        }
      `);

      const expectedOutput = `export interface GetPetTypes {
  pathParams: {
    petId: number;
  };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    };
  };
};
export const getPet = {
  method: 'GET',
  path: '/pets/{petId}'
};`;

      await readAndValidateComplete(runner, 'getPet', expectedOutput);
    });

    it('should generate POST operation with body parameters', async () => {
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
          @post
          createPet(@body pet: CreatePetRequest): Pet;
        }
      `);

      const expectedOutput = `export interface CreatePetTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body: {
    pet: {
      name: string;
      tag?: string;
    };
  };
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    };
  };
};
export const createPet = {
  method: 'POST',
  path: '/pets'
};`;

      await readAndValidateComplete(runner, 'createPet', expectedOutput);
    });

    it('should generate PUT operation with path and body parameters', async () => {
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
          @put
          updatePet(@path petId: int32, @body pet: Pet): Pet;
        }
      `);

      const expectedOutput = `export interface UpdatePetTypes {
  pathParams: {
    petId: number;
  };
  queryParams?: never;
  headers?: never;
  body: {
    pet: {
      id: number;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    };
  };
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    };
  };
};
export const updatePet = {
  method: 'PUT',
  path: '/pets/{petId}'
};`;

      await readAndValidateComplete(runner, 'updatePet', expectedOutput);
    });

    it('should generate DELETE operation with void return', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        @route("/pets")
        interface Pets {
          @delete
          deletePet(@path petId: int32): void;
        }
      `);

      const expectedOutput = `export interface DeletePetTypes {
  pathParams: {
    petId: number;
  };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: {
    statusCode: 204;
    data: void;
  };
};
export const deletePet = {
  method: 'DELETE',
  path: '/pets/{petId}'
};`;

      await readAndValidateComplete(runner, 'deletePet', expectedOutput);
    });
  });

  describe('Parameter Types', () => {
    it('should generate operation with query parameters', async () => {
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
      `);

      const expectedOutput = `export interface ListPetsTypes {
  pathParams?: never;
  queryParams?: {
    status?: string;
    limit?: number;
  };
  headers?: never;
  body?: never;
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    }[];
  };
};
export const listPets = {
  method: 'GET',
  path: '/pets'
};`;

      await readAndValidateComplete(runner, 'listPets', expectedOutput);
    });

    it('should generate operation with header parameters', async () => {
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

      const expectedOutput = `export interface SearchPetsTypes {
  pathParams?: never;
  queryParams: {
    q: string;
    category?: string;
  };
  headers: {
    authorization: string;
  };
  body?: never;
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    }[];
  };
};
export const searchPets = {
  method: 'GET',
  path: '/pets/search'
};`;

      await readAndValidateComplete(runner, 'searchPets', expectedOutput);
    });

    it('should generate operation with mixed parameter types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model User {
          id: int32;
          email: string;
        }

        @route("/users")
        interface Users {
          @put
          updateUser(
            @path userId: int32,
            @query notify?: boolean,
            @header authorization: string,
            @body userData: User
          ): User;
        }
      `);

      const expectedOutput = `export interface UpdateUserTypes {
  pathParams: {
    userId: number;
  };
  queryParams?: {
    notify?: boolean;
  };
  headers: {
    authorization: string;
  };
  body: {
    userData: {
      id: number;
      email: string;
    };
  };
  responses: {
    statusCode: 200;
    data: {
      id: number;
      email: string;
    };
  };
};
export const updateUser = {
  method: 'PUT',
  path: '/users/{userId}'
};`;

      await readAndValidateComplete(runner, 'updateUser', expectedOutput);
    });
  });

  describe('Response Types and Status Codes', () => {
    it('should use 204 for operations returning void', async () => {
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
  responses: {
    statusCode: 204;
    data: void;
  };
};
export const resetPets = {
  method: 'POST',
  path: '/pets'
};`;

      await readAndValidateComplete(runner, 'resetPets', expectedOutput);
    });

    it('should handle array return types', async () => {
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
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
    }[];
  };
};
export const listPets = {
  method: 'GET',
  path: '/pets'
};`;

      await readAndValidateComplete(runner, 'listPets', expectedOutput);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle CRUD API with multiple operations', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Product {
          id: int32;
          name: string;
          price: float64;
        }

        model CreateProductRequest {
          name: string;
          price: float64;
        }

        @route("/products")
        interface ProductAPI {
          @get
          list(@query category?: string): Product[];
          
          @post
          create(@body product: CreateProductRequest): Product;
          
          @get
          get(@path id: int32): Product;
          
          @delete
          delete(@path id: int32): void;
        }
      `);

      // Verify list operation
      const listExpected = `export interface ListTypes {
  pathParams?: never;
  queryParams?: {
    category?: string;
  };
  headers?: never;
  body?: never;
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      price: number;
    }[];
  };
};
export const list = {
  method: 'GET',
  path: '/products'
};`;

      await readAndValidateComplete(runner, 'list', listExpected);

      // Verify get operation
      const getExpected = `export interface GetTypes {
  pathParams: {
    id: number;
  };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      price: number;
    };
  };
};
export const get = {
  method: 'GET',
  path: '/products/{id}'
};`;

      await readAndValidateComplete(runner, 'get', getExpected);
    });

    it('should handle authentication scenarios', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model User {
          id: int32;
          email: string;
        }

        @route("/protected")
        interface ProtectedApi {
          @get
          getProfile(
            @header authorization: string,
            @header "x-api-key"?: string
          ): User;
        }
      `);

      const expectedOutput = `export interface GetProfileTypes {
  pathParams?: never;
  queryParams?: never;
  headers: {
    authorization: string;
    "x-api-key"?: string;
  };
  body?: never;
  responses: {
    statusCode: 200;
    data: {
      id: number;
      email: string;
    };
  };
};
export const getProfile = {
  method: 'GET',
  path: '/protected'
};`;

      await readAndValidateComplete(runner, 'getProfile', expectedOutput);
    });
  });
});

