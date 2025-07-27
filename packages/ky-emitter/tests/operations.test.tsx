import { t, type TesterInstance } from "@typespec/compiler/testing";
import { beforeEach, it } from "vitest";
import { OperationPart } from "../src/components/operation.jsx";
import { expectRender, Tester } from "./utils.jsx";

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it("complex", async () => {
  const { getPet } = await runner.compile(t.code`
    namespace Base {
      model Tag {
        value: string;
      }
    }

    model TagWithLabel {
      label: string;
      value: string;
    }

    model More {
      more: string;
    }

    model Pet {
      id: int32;
      name: string;
      tag?: Base.Tag | TagWithLabel;
      status: "available" | "pending" | "sold";
      ...Record<More>;
    }

    @route("/pets")
    interface Pets {
      @get
      op ${t.op("getPet")}(@path petId: int32): {
        @statusCode statusCode: 200;
        @header
        "x-extra-key": string;
        @body body: Pet | string;
      } | {
        @statusCode statusCode: 200;
        @body body: string;
      } | {
        @statusCode
        @minValue(400)
        @maxValue(599)
        statusCode: int32;
        @body body: { prop: Base.Tag };
      };
    }
  `);

  expectRender(
    runner.program,
    <OperationPart op={getPet} />,
    `
      export const getPet = {
        operationId: "getPet",
        method: "GET",
        path: "/pets/{petId}",
        response: {
          "200": {
            headers: ["x-extra-key"],
            contentTypes: ["application/json", "text/plain"],
          },
          "200": {
            headers: [],
            contentTypes: ["text/plain"],
          },
          "4XX": {
            headers: [],
            contentTypes: ["application/json"],
          },
          "5XX": {
            headers: [],
            contentTypes: ["application/json"],
          },
        },
      };
      export type GetPetRequest = {
        params: {
          path: {
            petId: number;
          };
          query?: never;
          header?: never;
          cookie?: never;
        };
        body?: never;
      };
      export type GetPetResponse = {
        statusCode: 200;
        headers: {
          "x-extra-key": string;
        };
        content: {
          id: number;
          name: string;
          tag?: {
            value: string;
          } | {
            label: string;
            value: string;
          };
          status: "available" | "pending" | "sold";
        } | string;
      } | {
        statusCode: 200;
        headers?: never;
        content: string;
      } | {
        statusCode: "4XX";
        headers?: never;
        content: {
          prop: {
            value: string;
          };
        };
      } | {
        statusCode: "5XX";
        headers?: never;
        content: {
          prop: {
            value: string;
          };
        };
      };
    `,
  );
});

it("default response", async () => {
  const { getPet } = await runner.compile(t.code`
    @defaultResponse
    model Pet {
      id: int32;
      name: string;
    }

    @route("/pets")
    interface Pets {
      @get
      op ${t.op("getPet")}(@path petId: int32): Pet;
    }
  `);

  expectRender(
    runner.program,
    <OperationPart op={getPet} />,
    `
      export const getPet = {
        operationId: "getPet",
        method: "GET",
        path: "/pets/{petId}",
        response: {
          default: {
            headers: [],
            contentTypes: ["application/json"],
          },
        },
      };
      export type GetPetRequest = {
        params: {
          path: {
            petId: number;
          };
          query?: never;
          header?: never;
          cookie?: never;
        };
        body?: never;
      };
      export type GetPetResponse = {
        statusCode: "default";
        headers?: never;
        content: {
          id: number;
          name: string;
        };
      };
    `,
  );
});

it("@operationId", async () => {
  const { listPets } = await runner.compile(t.code`
    model Pet {
      id: int32;
      name: string;
    }

    @route("/pets")
    interface Pets {
      @operationId("listAllPets")
      @get
      op ${t.op("listPets")}(): Pet[];
    }
  `);

  expectRender(
    runner.program,
    <OperationPart op={listPets} />,
    `
      export const listPets = {
        operationId: "listAllPets",
        method: "GET",
        path: "/pets",
        response: {
          "200": {
            headers: [],
            contentTypes: ["application/json"],
          },
        },
      };
      export type ListPetsRequest = {
        params?: never;
        body?: never;
      };
      export type ListPetsResponse = {
        statusCode: 200;
        headers?: never;
        content: {
          id: number;
          name: string;
        }[];
      };
    `,
  );
});

it("request body", async () => {
  const { createPet } = await runner.compile(t.code`
    model Pet {
      id: int32;
      name: string;
    }

    @route("/pets")
    interface Pets {
      @operationId("createPet")
      @post
      op ${t.op("createPet")}(@body pet: Pet | string): {
        @statusCode _: 201;
      };
    }
    `);

  expectRender(
    runner.program,
    <OperationPart op={createPet} />,
    `
      export const createPet = {
        operationId: "createPet",
        method: "POST",
        path: "/pets",
        response: {
          "201": {
            headers: [],
            contentTypes: [],
          },
        },
      };
      export type CreatePetRequest = {
        params?: never;
        body: {
          id: number;
          name: string;
        } | string;
      };
      export type CreatePetResponse = {
        statusCode: 201;
        headers?: never;
        content?: never;
      };
    `,
  );
});
