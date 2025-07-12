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
    };
  };
};
export const getPet = {
  method: 'GET',
  path: '/pets/{petId}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

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
  body: {
    pet: {
      id: number;
      name: string;
    };
  };
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
    };
  };
};
export const createPet = {
  method: 'POST',
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }
};`;

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
  path: '/pets/{petId}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

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
  responses: {
    statusCode: 204;
    data: void;
  };
};
export const resetPets = {
  method: 'POST',
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

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
  responses: {
    statusCode: 200;
    data: [
      {
        id: number;
        name: string;
      }
    ];
  };
};
export const listPets = {
  method: 'GET',
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

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
  pathParams: {
    petId: number;
  };
  queryParams?: never;
  headers?: never;
  body: {
    pet: {
      id: number;
      name: string;
    };
  };
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
    };
  };
};
export const updatePet = {
  method: 'PUT',
  path: '/pets/{petId}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }
};`;

      await readAndValidateComplete(runner, 'updatePet', expectedOutput);
    });
  });

  describe('Enhanced Multi-Status Code Support', () => {
    it('should handle operations with union return types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
        }

        model NotFoundError {
          message: "Pet not found";
          code: 404;
        }

        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet | NotFoundError;
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
    };
  };
};
export const getPet = {
  method: 'GET',
  path: '/pets/{petId}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'getPet', expectedOutput);
    });

    it('should handle complex union types with multiple error models', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
          status: "available" | "pending" | "sold";
        }

        model ValidationError {
          type: "validation_error";
          errors: string[];
        }

        model ServerError {
          type: "server_error";
          message: string;
        }

        @route("/pets")
        interface PetStore {
          @post
          createPet(@body pet: Pet): Pet | ValidationError | ServerError;
        }
      `);

      const expectedOutput = `export interface CreatePetTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body: {
    pet: {
      id: number;
      name: string;
      status: "available" | "pending" | "sold";
    };
  };
  responses: {
    statusCode: 200;
    data: {
      id: number;
      name: string;
      status: "available" | "pending" | "sold";
    };
  };
};
export const createPet = {
  method: 'POST',
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }
};`;

      await readAndValidateComplete(runner, 'createPet', expectedOutput);
    });

    it('should handle authentication scenarios with headers', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model User {
          id: int32;
          email: string;
        }

        model AuthError {
          message: "Unauthorized";
          code: 401;
        }

        @route("/protected")
        interface ProtectedApi {
          @get
          getProfile(
            @header authorization: string,
            @header "x-api-key"?: string
          ): User | AuthError;
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
  path: '/protected',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: true,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'getProfile', expectedOutput);
    });
  });

  describe('Status Code Infrastructure Validation', () => {
    it('should handle void returns with proper status codes', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        @route("/cleanup")
        interface CleanupApi {
          @post
          cleanup(): void;
          
          @delete
          deleteAll(): void;
        }
      `);

      // Test POST with void return - should default to 204
      const cleanupExpected = `export interface CleanupTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: {
    statusCode: 204;
    data: void;
  };
};
export const cleanup = {
  method: 'POST',
  path: '/cleanup',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'cleanup', cleanupExpected);

      // Test DELETE with void return - should default to 204
      const deleteAllExpected = `export interface DeleteAllTypes {
  pathParams?: never;
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: {
    statusCode: 204;
    data: void;
  };
};
export const deleteAll = {
  method: 'DELETE',
  path: '/cleanup',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'deleteAll', deleteAllExpected);
    });
  });

  describe('Real-World Multi-Status Scenarios', () => {
    it('should handle complete CRUD API with proper responses', async () => {
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

        model NotFoundError {
          message: "Product not found";
          productId: int32;
        }

        model ValidationError {
          message: "Invalid input";
          field: string;
        }

        @route("/products")
        interface ProductAPI {
          @get
          list(@query category?: string): Product[];
          
          @post
          create(@body product: CreateProductRequest): Product | ValidationError;
          
          @get
          get(@path id: int32): Product | NotFoundError;
          
          @delete
          delete(@path id: int32): void;
        }
      `);

      // Verify list operation (simple GET)
      const listExpected = `export interface ListTypes {
  pathParams?: never;
  queryParams?: {
    category?: string;
  };
  headers?: never;
  body?: never;
  responses: {
    statusCode: 200;
    data: [
      {
        id: number;
        name: string;
        price: number;
      }
    ];
  };
};
export const list = {
  method: 'GET',
  path: '/products',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: false,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'list', listExpected);

      // Verify get operation (with path param and error)
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
  path: '/products/{id}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'get', getExpected);

      // Verify delete operation (void return)
      const deleteExpected = `export interface DeleteTypes {
  pathParams: {
    id: number;
  };
  queryParams?: never;
  headers?: never;
  body?: never;
  responses: {
    statusCode: 204;
    data: void;
  };
};
export const delete_ = {
  method: 'DELETE',
  path: '/products/{id}',
  parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'delete', deleteExpected);
    });
  });
});
