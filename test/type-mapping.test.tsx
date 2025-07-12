import { describe, it, expect } from 'vitest';
import { readGeneratedFile } from './utils.jsx';
import { compilePetsApi } from './pets-helpers.jsx';

describe('Type Mapping', () => {
  describe('Scalar Types', () => {
    it('should map TypeSpec scalars to TypeScript types', async () => {
      const runner = await compilePetsApi(`
        model ScalarTypes {
          stringProp: string;
          int32Prop: int32;
          int64Prop: int64;
          float32Prop: float32;
          float64Prop: float64;
          booleanProp: boolean;
          optionalString?: string;
        }

        @route("/scalars")
        interface Scalars {
          @get
          getScalars(): ScalarTypes;
        }
      `);

      const content = await readGeneratedFile(runner, 'api/schemas.ts');

      expect(content).toContain('stringProp: string');
      expect(content).toContain('int32Prop: number');
      expect(content).toContain('int64Prop: number');
      expect(content).toContain('float32Prop: number');
      expect(content).toContain('float64Prop: number');
      expect(content).toContain('booleanProp: boolean');
      expect(content).toContain('optionalString?: string');
    });
  });

  describe('Array Types', () => {
    it('should map TypeSpec arrays to TypeScript arrays', async () => {
      const runner = await compilePetsApi(`
        model ArrayTypes {
          stringArray: string[];
          numberArray: int32[];
          petArray: Pet[];
        }

        @route("/arrays")
        interface Arrays {
          @get
          getArrays(): ArrayTypes;
        }
      `);

      const content = await readGeneratedFile(runner, 'api/schemas.ts');

      expect(content).toContain('stringArray: string[]');
      expect(content).toContain('numberArray: number[]');
      expect(content).toContain('petArray: Pet[]');
    });
  });

  describe('Union Types', () => {
    it('should map TypeSpec unions to TypeScript union types', async () => {
      const runner = await compilePetsApi(`
        model UnionTypes {
          status: "active" | "inactive" | "pending";
          idOrName: string | int32;
        }

        @route("/unions")
        interface Unions {
          @get
          getUnions(): UnionTypes;
        }
      `);

      const content = await readGeneratedFile(runner, 'api/schemas.ts');

      expect(content).toContain('status: "active" | "inactive" | "pending"');
      expect(content).toContain('idOrName: string | number');
    });
  });

  describe('Nested Models', () => {
    it('should handle nested model references', async () => {
      const runner = await compilePetsApi(`
        model Address {
          street: string;
          city: string;
          zipCode: string;
        }

        model Owner {
          id: int32;
          name: string;
          address: Address;
        }

        model PetWithOwner {
          id: int32;
          name: string;
          owner: Owner;
        }

        @route("/pets")
        interface Pets {
          @get
          getPetWithOwner(@path petId: int32): PetWithOwner;
        }
      `);

      const content = await readGeneratedFile(runner, 'api/schemas.ts');

      expect(content).toContain('export interface Address');
      expect(content).toContain('export interface Owner');
      expect(content).toContain('export interface PetWithOwner');
      expect(content).toContain('address: Address');
      expect(content).toContain('owner: Owner');
    });
  });
});
