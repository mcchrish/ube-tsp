import { describe, it, expect } from "vitest";
import { readGeneratedFile } from "./utils.jsx";
import { compilePetsApi } from "./pets-helpers.jsx";

describe("Emitter Integration", () => {
  it("should generate complete API structure for Pets API", async () => {
    const runner = await compilePetsApi(`
      @route("/pets")
      interface Pets {
        @get
        listPets(@query status?: string, @query limit?: int32): Pet[];
        
        @post
        createPet(@body pet: CreatePetRequest): Pet;
        
        @get
        getPet(@path petId: int32): Pet;
        
        @put
        updatePet(@path petId: int32, @body pet: Pet): Pet;
        
        @delete
        deletePet(@path petId: int32): void;
        
        @get
        @route("/search")
        searchPets(@header authorization: string, @query q: string): Pet[];
      }
    `);

    // Test schemas.ts generation
    const schemasContent = await readGeneratedFile(runner, "api/schemas.ts");
    expect(schemasContent).toContain("export interface Pet");
    expect(schemasContent).toContain("export interface CreatePetRequest");

    // Test individual operation files
    const operations = [
      "listPets",
      "createPet", 
      "getPet",
      "updatePet",
      "deletePet",
      "searchPets"
    ];

    for (const operation of operations) {
      const operationContent = await readGeneratedFile(runner, `api/operations/${operation}.ts`);
      expect(operationContent).toContain(`export const operationId = '${operation}' as const`);
      expect(operationContent).toContain("export const method =");
      expect(operationContent).toContain("export const path =");
      expect(operationContent).toContain("export const operation = {");
    }
  });

  it("should handle complex API with multiple interfaces", async () => {
    const runner = await compilePetsApi(`
      model Store {
        id: int32;
        name: string;
        address: string;
      }

      @route("/stores")
      interface Stores {
        @get
        listStores(): Store[];
        
        @post
        createStore(@body store: Store): Store;
      }

      @route("/pets")
      interface Pets {
        @get
        listPets(@query storeId?: int32): Pet[];
        
        @post
        createPet(@body pet: CreatePetRequest): Pet;
      }
    `);

    const schemasContent = await readGeneratedFile(runner, "api/schemas.ts");
    expect(schemasContent).toContain("export interface Store");
    expect(schemasContent).toContain("export interface Pet");
    expect(schemasContent).toContain("export interface CreatePetRequest");

    // Test store operations
    const listStoresContent = await readGeneratedFile(runner, "api/operations/listStores.ts");
    expect(listStoresContent).toContain("export const path = '/stores' as const");
    expect(listStoresContent).toContain("export const method = 'GET' as const");

    const createStoreContent = await readGeneratedFile(runner, "api/operations/createStore.ts");
    expect(createStoreContent).toContain("export const path = '/stores' as const");
    expect(createStoreContent).toContain("export const method = 'POST' as const");
    expect(createStoreContent).toContain("export interface RequestBody");

    // Test pet operations
    const listPetsContent = await readGeneratedFile(runner, "api/operations/listPets.ts");
    expect(listPetsContent).toContain("export const path = '/pets' as const");
    expect(listPetsContent).toContain("export interface QueryParams");
    expect(listPetsContent).toContain("storeId?: number");
  });

  it("should generate proper TypeScript imports and exports", async () => {
    const runner = await compilePetsApi(`
      @route("/pets")
      interface Pets {
        @get
        getPet(@path petId: int32): Pet;
      }
    `);

    const operationContent = await readGeneratedFile(runner, "api/operations/getPet.ts");
    
    // Check that all exports are properly declared
    expect(operationContent).toContain("export const operationId");
    expect(operationContent).toContain("export const method");
    expect(operationContent).toContain("export const path");
    expect(operationContent).toContain("export interface PathParams");
    expect(operationContent).toContain("export type Response200");
    expect(operationContent).toContain("export const operation");
  });
});