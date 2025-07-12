import { describe, it } from 'vitest';
import {
  readAndValidateComplete,
  readAndValidateSection,
  createEmitterTestRunner,
} from './utils.jsx';

describe('Operation Components', () => {
  describe('Complete Operation Validation', () => {
    it('should generate complete CreatePet operation exactly', async () => {
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

    it('should generate complete GetPet operation exactly', async () => {
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

    it('should generate complete UpdatePet operation exactly', async () => {
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

    it('should generate complete DeletePet operation exactly', async () => {
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

    it('should generate complete ListPets operation with query parameters exactly', async () => {
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
    data: [
      {
        id: number;
        name: string;
        tag?: string;
        status: "available" | "pending" | "sold";
      }
    ];
  };
};
export const listPets = {
  method: 'GET',
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: false,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'listPets', expectedOutput);
    });

    it('should generate complete SearchPets operation with query and header parameters exactly', async () => {
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
    data: [
      {
        id: number;
        name: string;
        tag?: string;
        status: "available" | "pending" | "sold";
      }
    ];
  };
};
export const searchPets = {
  method: 'GET',
  path: '/pets/search',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: true,
    hasBody: false
  }
};`;

      await readAndValidateComplete(runner, 'searchPets', expectedOutput);
    });
  });

  describe('Interface Section Validation', () => {
    it('should generate correct interface section for CreatePet', async () => {
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

      const expectedInterfaceSection = `export interface CreatePetTypes {
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
};`;

      await readAndValidateSection(
        runner,
        'createPet',
        expectedInterfaceSection,
        'interface section',
      );
    });

    it('should generate correct interface section for GetPet', async () => {
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

      const expectedInterfaceSection = `export interface GetPetTypes {
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
};`;

      await readAndValidateSection(
        runner,
        'getPet',
        expectedInterfaceSection,
        'interface section',
      );
    });
  });

  describe('Config Section Validation', () => {
    it('should generate correct config section for CreatePet', async () => {
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

      const expectedConfigSection = `export const createPet = {
  method: 'POST',
  path: '/pets',
  parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }
};`;

      await readAndValidateSection(
        runner,
        'createPet',
        expectedConfigSection,
        'config section',
      );
    });
  });

  describe('Parameter Type Sections', () => {
    it('should generate correct parameterTypes section for body operation', async () => {
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

      const expectedParameterTypesSection = `parameterTypes: {
    hasPathParams: false,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }`;

      await readAndValidateSection(
        runner,
        'createPet',
        expectedParameterTypesSection,
        'parameterTypes section',
      );
    });

    it('should generate correct parameterTypes section for path operation', async () => {
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

      const expectedParameterTypesSection = `parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: false
  }`;

      await readAndValidateSection(
        runner,
        'getPet',
        expectedParameterTypesSection,
        'parameterTypes section',
      );
    });

    it('should generate correct parameterTypes section for query operation', async () => {
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

      const expectedParameterTypesSection = `parameterTypes: {
    hasPathParams: false,
    hasQueryParams: true,
    hasHeaders: false,
    hasBody: false
  }`;

      await readAndValidateSection(
        runner,
        'listPets',
        expectedParameterTypesSection,
        'parameterTypes section',
      );
    });

    it('should generate correct parameterTypes section for path and body operation', async () => {
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

      const expectedParameterTypesSection = `parameterTypes: {
    hasPathParams: true,
    hasQueryParams: false,
    hasHeaders: false,
    hasBody: true
  }`;

      await readAndValidateSection(
        runner,
        'updatePet',
        expectedParameterTypesSection,
        'parameterTypes section',
      );
    });
  });
});
