import { describe, it, expect } from 'vitest';
import { createEmitterTestRunner, readOperationFile } from './utils.jsx';

describe('Emitter Integration - Smoke Tests', () => {
  it('should compile basic TypeSpec without errors and generate operation files', async () => {
    const runner = await createEmitterTestRunner();
    
    // Basic compilation smoke test - verify the emitter works end-to-end
    await runner.compile(`
      model Pet {
        id: int32;
        name: string;
        status: "available" | "pending" | "sold";
      }

      @route("/pets")
      interface Pets {
        @get
        getPet(@path petId: int32): Pet;
        
        @post
        createPet(@body pet: Pet): Pet;
        
        @delete
        deletePet(@path petId: int32): void;
      }
    `);

    // Verify that files were generated and contain expected basic structure
    const getPetContent = await readOperationFile(runner, 'getPet');
    expect(getPetContent.length).toBeGreaterThan(0);
    expect(getPetContent).toContain('export interface GetPetTypes');
    expect(getPetContent).toContain('export const getPet');
    
    const createPetContent = await readOperationFile(runner, 'createPet');
    expect(createPetContent.length).toBeGreaterThan(0);
    expect(createPetContent).toContain('export interface CreatePetTypes');
    expect(createPetContent).toContain('export const createPet');
    
    const deletePetContent = await readOperationFile(runner, 'deletePet');
    expect(deletePetContent.length).toBeGreaterThan(0);
    expect(deletePetContent).toContain('export interface DeletePetTypes');
    expect(deletePetContent).toContain('export const deletePet');
  });

  it('should handle complex TypeSpec scenarios without compilation errors', async () => {
    const runner = await createEmitterTestRunner();
    
    // Test complex nested types, arrays, and multiple routes
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
        tags: string[];
      }

      @route("/pets")
      interface Pets {
        @get
        listPets(@query status?: string, @query limit?: int32): PetWithOwner[];
        
        @post
        createPetWithOwner(@body petData: PetWithOwner): PetWithOwner;
      }
      
      @route("/pets/search")
      interface PetSearch {
        @get
        searchPets(
          @query q: string,
          @query category?: string,
          @header authorization: string
        ): PetWithOwner[];
      }
    `);

    // Verify that files were generated with expected structure
    const listPetsContent = await readOperationFile(runner, 'listPets');
    expect(listPetsContent.length).toBeGreaterThan(0);
    expect(listPetsContent).toContain('export interface ListPetsTypes');
    expect(listPetsContent).toContain('queryParams');
    
    const createContent = await readOperationFile(runner, 'createPetWithOwner');
    expect(createContent.length).toBeGreaterThan(0);
    expect(createContent).toContain('export interface CreatePetWithOwnerTypes');
    expect(createContent).toContain('body');
    
    const searchContent = await readOperationFile(runner, 'searchPets');
    expect(searchContent.length).toBeGreaterThan(0);
    expect(searchContent).toContain('export interface SearchPetsTypes');
    expect(searchContent).toContain('headers');
  });

  it('should handle all HTTP methods and parameter types without errors', async () => {
    const runner = await createEmitterTestRunner();
    
    // Test all HTTP methods and various parameter combinations
    await runner.compile(`
      model Task {
        id: int32;
        title: string;
        status: "todo" | "in-progress" | "done";
      }

      @route("/tasks")
      interface TaskAPI {
        @get
        list(@query status?: string): Task[];
        
        @post
        create(@body task: Task): Task;
        
        @put
        update(@path id: int32, @body task: Task): Task;
        
        @patch
        partialUpdate(@path id: int32, @body updates: { title?: string; status?: string }): Task;
        
        @delete
        delete(@path id: int32): void;
        
        @get
        search(
          @path projectId: int32,
          @query q: string,
          @header authorization: string,
          @header "x-request-id"?: string
        ): Task[];
      }
    `);

    // Verify all operations generated successfully
    const operations = ['list', 'create', 'update', 'partialUpdate', 'delete', 'search'];
    
    for (const operation of operations) {
      const content = await readOperationFile(runner, operation);
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain(`export interface`);
      expect(content).toContain(`export const ${operation}`);
    }
  });

  it('should handle enum types and union types without errors', async () => {
    const runner = await createEmitterTestRunner();
    
    // Test enums, unions, and complex type combinations
    await runner.compile(`
      enum Priority {
        Low: "low",
        Medium: "medium",
        High: "high"
      }

      model ValidationError {
        message: string;
        field: string;
      }

      model SuccessResponse {
        id: int32;
        message: string;
      }

      model ComplexModel {
        id: int32;
        priority: Priority;
        status: "active" | "inactive" | "pending";
        metadata?: Record<string>;
        tags: string[];
      }

      @route("/complex")
      interface ComplexAPI {
        @post
        create(@body data: ComplexModel): SuccessResponse | ValidationError;
        
        @get
        get(@path id: int32): ComplexModel | ValidationError;
      }
    `);

    // Verify complex types are handled
    const createContent = await readOperationFile(runner, 'create');
    expect(createContent.length).toBeGreaterThan(0);
    expect(createContent).toContain('export interface CreateTypes');
    
    const getContent = await readOperationFile(runner, 'get');
    expect(getContent.length).toBeGreaterThan(0);
    expect(getContent).toContain('export interface GetTypes');
  });
});