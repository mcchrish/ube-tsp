import { describe, it, expect } from 'vitest';
import { readGeneratedFile } from './utils.jsx';
import { compilePetsApi } from './pets-helpers.jsx';

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

      expect(content).toContain("export const operationId = 'getPet' as const");
      expect(content).toContain("export const method = 'GET' as const");
      expect(content).toContain("export const path = '/pets/{petId}' as const");
      expect(content).toContain('export interface PathParams');
      expect(content).toContain('petId: number');
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

      expect(content).toContain(
        "export const operationId = 'listPets' as const",
      );
      expect(content).toContain("export const method = 'GET' as const");
      expect(content).toContain("export const path = '/pets' as const");
      expect(content).toContain('export interface QueryParams');
      expect(content).toContain('status?: string');
      expect(content).toContain('limit?: number');
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

      expect(content).toContain(
        "export const operationId = 'createPet' as const",
      );
      expect(content).toContain("export const method = 'POST' as const");
      expect(content).toContain("export const path = '/pets' as const");
      expect(content).toContain('export interface RequestBody');
      expect(content).toContain('pet: CreatePetRequest');
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

      expect(content).toContain(
        "export const operationId = 'updatePet' as const",
      );
      expect(content).toContain("export const method = 'PUT' as const");
      expect(content).toContain("export const path = '/pets/{petId}' as const");
      expect(content).toContain('export interface PathParams');
      expect(content).toContain('petId: number');
      expect(content).toContain('export interface RequestBody');
      expect(content).toContain('pet: Pet');
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

      expect(content).toContain(
        "export const operationId = 'searchPets' as const",
      );
      expect(content).toContain("export const method = 'GET' as const");
      expect(content).toContain("export const path = '/pets/search' as const");
      expect(content).toContain('export interface HeaderParams');
      expect(content).toContain('authorization: string');
      expect(content).toContain('export interface QueryParams');
      expect(content).toContain('q: string');
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
      expect(getPetContent).toContain('export type Response200 = Pet');

      const listPetsContent = await readGeneratedFile(
        runner,
        'api/operations/listPets.ts',
      );
      expect(listPetsContent).toContain('export type Response200 = Pet[]');

      const deletePetContent = await readGeneratedFile(
        runner,
        'api/operations/deletePet.ts',
      );
      expect(deletePetContent).toContain('export type Response200 = void');
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

      expect(content).toContain('export const operation = {');
      expect(content).toContain("operationId: 'getPet'");
      expect(content).toContain("method: 'GET'");
      expect(content).toContain("path: '/pets/{petId}'");
      expect(content).toContain('parameters: {');
      expect(content).toContain('path: true');
      expect(content).toContain('responses: [200]');
      expect(content).toContain('} as const');
    });
  });
});
