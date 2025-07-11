import { describe, it, expect } from "vitest";
import { readGeneratedFile } from "./utils.jsx";
import { compilePetsApi } from "./pets-helpers.jsx";

describe("Schema Generation", () => {
  it("should generate Pet interface in schemas.ts", async () => {
    const runner = await compilePetsApi(`
      @route("/pets")
      interface Pets {
        @get
        getPet(@path petId: int32): Pet;
      }
    `);

    const content = await readGeneratedFile(runner, "api/schemas.ts");
    
    expect(content).toContain("export interface Pet");
    expect(content).toContain("id: number");
    expect(content).toContain("name: string");
    expect(content).toContain("tag?: string");
    expect(content).toContain("status: \"available\" | \"pending\" | \"sold\"");
  });

  it("should generate CreatePetRequest interface in schemas.ts", async () => {
    const runner = await compilePetsApi(`
      @route("/pets")
      interface Pets {
        @post
        createPet(@body pet: CreatePetRequest): Pet;
      }
    `);

    const content = await readGeneratedFile(runner, "api/schemas.ts");
    
    expect(content).toContain("export interface CreatePetRequest");
    expect(content).toContain("name: string");
    expect(content).toContain("tag?: string");
  });

  it("should handle complex nested models", async () => {
    const runner = await compilePetsApi(`
      model Owner {
        id: int32;
        name: string;
        email: string;
      }

      model PetWithOwner {
        id: int32;
        name: string;
        owner: Owner;
        tags: string[];
      }

      @route("/pets")
      interface Pets {
        @get
        getPetWithOwner(@path petId: int32): PetWithOwner;
      }
    `);

    const content = await readGeneratedFile(runner, "api/schemas.ts");
    
    expect(content).toContain("export interface Owner");
    expect(content).toContain("export interface PetWithOwner");
    expect(content).toContain("owner: Owner");
    expect(content).toContain("tags: string[]");
  });
});