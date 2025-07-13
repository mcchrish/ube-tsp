import { describe, it } from 'vitest';
import { readAndValidateSection, createEmitterTestRunner } from './utils.jsx';

describe('Type Mapping', () => {
  describe('Union Types', () => {
    it('should correctly map string literal unions', async () => {
      const runner = await createEmitterTestRunner();
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
        }
      `);

      const expectedStatusType = `status: "available" | "pending" | "sold";`;

      await readAndValidateSection(
        runner,
        'getPet',
        expectedStatusType,
        'string literal union type',
      );
    });

    it('should handle complex union types with mixed primitives', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Config {
          value: string | int32 | boolean;
          priority: "low" | "medium" | "high";
        }

        @route("/config")
        interface ConfigAPI {
          @get
          getConfig(): Config;
        }
      `);

      const expectedValueType = `value: string | number | boolean;`;
      const expectedPriorityType = `priority: "low" | "medium" | "high";`;

      await readAndValidateSection(
        runner,
        'getConfig',
        expectedValueType,
        'mixed primitive union type',
      );

      await readAndValidateSection(
        runner,
        'getConfig',
        expectedPriorityType,
        'string literal union type',
      );
    });

    it.only('should handle nested model unions', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Cat {
          type: "cat";
          meows: boolean;
        }

        model Dog {
          type: "dog";
          barks: boolean;
        }

        model Pet {
          id: int32;
          animal: Cat | Dog;
        }

        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
        }
      `);

      const expectedAnimalType = `animal: {
        type: "cat";
        meows: boolean;
      } | {
        type: "dog";
        barks: boolean;
      };`;

      await readAndValidateSection(
        runner,
        'getPet',
        expectedAnimalType,
        'nested model union type',
      );
    });
  });

  describe('Primitive Type Mapping', () => {
    it('should correctly map TypeSpec primitives to TypeScript types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model AllScalars {
          stringValue: string;
          intValue: int32;
          floatValue: float64;
          boolValue: boolean;
          bigIntValue: int64;
        }

        @route("/scalars")
        interface ScalarAPI {
          @get
          getAllScalars(): AllScalars;
        }
      `);

      const expectedTypes = [
        'stringValue: string;',
        'intValue: number;',
        'floatValue: number;',
        'boolValue: boolean;',
        'bigIntValue: number;',
      ];

      for (const expectedType of expectedTypes) {
        await readAndValidateSection(
          runner,
          'getAllScalars',
          expectedType,
          `primitive type mapping: ${expectedType}`,
        );
      }
    });

    it('should handle optional types correctly', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model User {
          id: int32;
          name: string;
          email?: string;
          age?: int32;
        }

        @route("/users")
        interface Users {
          @get
          getUser(@path userId: int32): User;
        }
      `);

      const expectedOptionalTypes = ['email?: string;', 'age?: number;'];

      for (const expectedType of expectedOptionalTypes) {
        await readAndValidateSection(
          runner,
          'getUser',
          expectedType,
          `optional type mapping: ${expectedType}`,
        );
      }
    });
  });

  describe('Array Types', () => {
    it('should correctly map array types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Pet {
          id: int32;
          name: string;
          tags: string[];
        }

        @route("/pets")
        interface Pets {
          @get
          getPets(): Pet[];
        }
      `);

      // Check array return type in responses
      const expectedArrayResponse = `data: {
      id: number;
      name: string;
      tags: string[];
    }[];`;

      await readAndValidateSection(
        runner,
        'getPets',
        expectedArrayResponse,
        'array return type',
      );

      // Check string array property
      const expectedTagsType = `tags: string[];`;

      await readAndValidateSection(
        runner,
        'getPets',
        expectedTagsType,
        'string array property type',
      );
    });

    it('should handle nested array types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Permission {
          action: string;
          resource: string;
        }

        model Role {
          name: string;
          permissions: Permission[];
        }

        model User {
          id: int32;
          roles: Role[];
        }

        @route("/users")
        interface Users {
          @get
          getUser(@path userId: int32): User;
        }
      `);

      const expectedNestedArrayType = `roles: {
        name: string;
        permissions: {
          action: string;
          resource: string;
        }[];
      }[];`;

      await readAndValidateSection(
        runner,
        'getUser',
        expectedNestedArrayType,
        'nested array type',
      );
    });
  });

  describe('Nested Models', () => {
    it('should correctly map nested object types', async () => {
      const runner = await createEmitterTestRunner();
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

        model Pet {
          id: int32;
          name: string;
          owner: Owner;
        }

        @route("/pets")
        interface Pets {
          @get
          getPet(@path petId: int32): Pet;
        }
      `);

      const expectedNestedType = `owner: {
        name: string;
        email: string;
        address: {
          street: string;
          city: string;
          zipCode?: string;
        };
      };`;

      await readAndValidateSection(
        runner,
        'getPet',
        expectedNestedType,
        'nested model type',
      );
    });

    it('should handle deeply nested structures', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Contact {
          phone: string;
          email: string;
        }

        model Address {
          street: string;
          city: string;
          contact: Contact;
        }

        model Organization {
          name: string;
          address: Address;
        }

        model Employee {
          id: int32;
          name: string;
          organization: Organization;
        }

        @route("/employees")
        interface Employees {
          @get
          getEmployee(@path empId: int32): Employee;
        }
      `);

      const expectedDeeplyNestedType = `organization: {
        name: string;
        address: {
          street: string;
          city: string;
          contact: {
            phone: string;
            email: string;
          };
        };
      };`;

      await readAndValidateSection(
        runner,
        'getEmployee',
        expectedDeeplyNestedType,
        'deeply nested model type',
      );
    });
  });

  describe('Enum Types', () => {
    it('should map TypeSpec enums to TypeScript union types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        enum TaskStatus {
          Pending: "pending",
          InProgress: "in-progress", 
          Completed: "completed",
          Cancelled: "cancelled"
        }

        model Task {
          id: int32;
          title: string;
          status: TaskStatus;
        }

        @route("/tasks")
        interface Tasks {
          @get
          getTask(@path taskId: int32): Task;
        }
      `);

      const expectedEnumType = `status: "pending" | "in-progress" | "completed" | "cancelled";`;

      await readAndValidateSection(
        runner,
        'getTask',
        expectedEnumType,
        'enum to union type mapping',
      );
    });
  });

  describe('Complex Type Combinations', () => {
    it('should handle mixed complex types', async () => {
      const runner = await createEmitterTestRunner();
      await runner.compile(`
        model Tag {
          name: string;
          color: "red" | "blue" | "green";
        }

        model Category {
          id: int32;
          name: string;
          tags?: Tag[];
        }

        model Product {
          id: int32;
          name: string;
          price: float64;
          category: Category;
          inStock: boolean;
          variants?: string[];
        }

        @route("/products")
        interface Products {
          @post
          createProduct(@body product: Product): Product;
        }
      `);

      // Check the complex body structure
      const expectedBodyStructure = `body: {
    product: {
      id: number;
      name: string;
      price: number;
      category: {
        id: number;
        name: string;
        tags?: {
          name: string;
          color: "red" | "blue" | "green";
        }[];
      };
      inStock: boolean;
      variants?: string[];
    };
  };`;

      await readAndValidateSection(
        runner,
        'createProduct',
        expectedBodyStructure,
        'complex nested type structure',
      );
    });
  });
});
