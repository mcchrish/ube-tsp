import { describe, it, expect } from 'vitest';
import { readGeneratedFile } from './utils.jsx';
import { compilePetsApi } from './pets-helpers.jsx';
import { formatExpectedOperation, EXPECTED_OPERATIONS } from './expected-outputs.js';

describe('Pets API Operations', () => {
  describe('Path Parameters', () => {
    it('should generate PathParams interface for getPet operation', async () => {
      const runner = await compilePetsApi(`
        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
        }
      `);

      const content = await readGeneratedFile(
        runner,
        'api/operations/getPet.ts',
      );

      const expected = formatExpectedOperation(EXPECTED_OPERATIONS.getPet());
      expect(content.trim()).toBe(expected.trim());
    });
  });

  describe('Query Parameters', () => {
    it('should generate QueryParams interface for listPets operation', async () => {
      const runner = await compilePetsApi(`
        @route("/pets")
        interface Pets {
          @get
          listPets(@query status?: string, @query limit?: int32): Pet[];
        }
      `);

      const content = await readGeneratedFile(
        runner,
        'api/operations/listPets.ts',
      );

      const expected = formatExpectedOperation(EXPECTED_OPERATIONS.listPets());
      expect(content.trim()).toBe(expected.trim());
    });
  });

  describe('Request Body', () => {
    it('should generate RequestBody interface for createPet operation', async () => {
      const runner = await compilePetsApi(`
        @route("/pets")
        interface Pets {
          @post
          createPet(@body pet: CreatePetRequest): Pet;
        }
      `);

      const content = await readGeneratedFile(
        runner,
        'api/operations/createPet.ts',
      );

      const expected = formatExpectedOperation(EXPECTED_OPERATIONS.createPet());
      expect(content.trim()).toBe(expected.trim());
    });

    it('should generate RequestBody interface for updatePet operation', async () => {
      const runner = await compilePetsApi(`
        @route("/pets")
        interface Pets {
          @put
          updatePet(@path petId: int32, @body pet: Pet): Pet;
        }
      `);

      const content = await readGeneratedFile(
        runner,
        'api/operations/updatePet.ts',
      );

      const expected = formatExpectedOperation(EXPECTED_OPERATIONS.updatePet());
      expect(content.trim()).toBe(expected.trim());
    });
  });

  describe('Header Parameters', () => {
    it('should generate HeaderParams interface for searchPets operation', async () => {
      const runner = await compilePetsApi(`
        @route("/pets")
        interface Pets {
          @get
          @route("/search")
          searchPets(@header authorization: string, @query q: string): Pet[];
        }
      `);

      const content = await readGeneratedFile(
        runner,
        'api/operations/searchPets.ts',
      );

      const expected = formatExpectedOperation(EXPECTED_OPERATIONS.searchPets());
      expect(content.trim()).toBe(expected.trim());
    });
  });

  describe('Response Types', () => {
    it('should generate Response200 type for successful operations', async () => {
      const runner = await compilePetsApi(`
        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
          
          @get
          listPets(): Pet[];
          
          @delete
          deletePet(@path petId: int32): void;
        }
      `);

      const getPetContent = await readGeneratedFile(
        runner,
        'api/operations/getPet.ts',
      );
      const expectedGetPet = formatExpectedOperation(EXPECTED_OPERATIONS.getPet());
      expect(getPetContent.trim()).toBe(expectedGetPet.trim());

      // Create a simple listPets expectation for this test (no query params)
      const expectedListPets = formatExpectedOperation({
        imports: ['import type { Pet } from "../schemas.js";'],
        operationId: 'listPets',
        method: 'GET',
        path: '/pets',
        responseType: 'Pet[]',
        operationConfig: {
          operationId: 'listPets',
          method: 'GET',
          path: '/pets',
          responses: [200]
        }
      });
      const listPetsContent = await readGeneratedFile(
        runner,
        'api/operations/listPets.ts',
      );
      expect(listPetsContent.trim()).toBe(expectedListPets.trim());

      const deletePetContent = await readGeneratedFile(
        runner,
        'api/operations/deletePet.ts',
      );
      const expectedDeletePet = formatExpectedOperation(EXPECTED_OPERATIONS.deletePet());
      expect(deletePetContent.trim()).toBe(expectedDeletePet.trim());
    });
  });

  describe('Operation Configuration', () => {
    it('should generate comprehensive operation configuration object', async () => {
      const runner = await compilePetsApi(`
        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
        }
      `);

      const content = await readGeneratedFile(
        runner,
        'api/operations/getPet.ts',
      );

      const expected = formatExpectedOperation(EXPECTED_OPERATIONS.getPet());
      expect(content.trim()).toBe(expected.trim());
    });
  });
});
