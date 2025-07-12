import { describe, it } from 'vitest';
import { 
  readAndValidateComplete,
  readAndValidateSection,
  createEmitterTestRunner,
} from './utils.jsx';
import { EXPECTED_OPERATIONS, EXPECTED_SECTIONS } from './expected-operations.js';

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

      await readAndValidateComplete(runner, 'createPet', EXPECTED_OPERATIONS.createPet);
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

      await readAndValidateComplete(runner, 'getPet', EXPECTED_OPERATIONS.getPet);
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

      await readAndValidateComplete(runner, 'updatePet', EXPECTED_OPERATIONS.updatePet);
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

      await readAndValidateComplete(runner, 'deletePet', EXPECTED_OPERATIONS.deletePet);
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

      await readAndValidateComplete(runner, 'listPets', EXPECTED_OPERATIONS.listPets);
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

      await readAndValidateComplete(runner, 'searchPets', EXPECTED_OPERATIONS.searchPets);
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

      await readAndValidateSection(
        runner,
        'createPet',
        EXPECTED_SECTIONS.createPetInterface,
        'interface section'
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

      await readAndValidateSection(
        runner,
        'getPet',
        EXPECTED_SECTIONS.getPetInterface,
        'interface section'
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

      await readAndValidateSection(
        runner,
        'createPet',
        EXPECTED_SECTIONS.createPetConfig,
        'config section'
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

      await readAndValidateSection(
        runner,
        'createPet',
        EXPECTED_SECTIONS.parameterTypesWithBody,
        'parameterTypes section'
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

      await readAndValidateSection(
        runner,
        'getPet',
        EXPECTED_SECTIONS.parameterTypesWithPath,
        'parameterTypes section'
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

      await readAndValidateSection(
        runner,
        'listPets',
        EXPECTED_SECTIONS.parameterTypesWithQuery,
        'parameterTypes section'
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

      await readAndValidateSection(
        runner,
        'updatePet',
        EXPECTED_SECTIONS.parameterTypesWithPathAndBody,
        'parameterTypes section'
      );
    });
  });
});