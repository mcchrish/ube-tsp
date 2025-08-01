import { render } from "@alloy-js/core";
import { t, type TesterInstance } from "@typespec/compiler/testing";
import { Output } from "@typespec/emitter-framework";
import { beforeEach, it } from "vitest";
import { NamespaceContent, NamespaceStructure } from "../src/components/namespace.jsx";
import { assertFileContents, expectRender, Tester } from "./utils.jsx";

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it("complex", async () => {
  const { Base } = await runner.compile(t.code`
    namespace ${t.namespace("Base")} {
      model Tag {
        value: string;
      }
      namespace Foo {
        model Bar {
          name: string;
        }
      }
      namespace Other {
        model More {
          name: string;
        }
        namespace Here {
          model There {
            name: string;
          }
        }
      }
    }
  `);

  expectRender(
    runner.program,
    <NamespaceContent name="Base" ns={Base} />,
    `
      export type Tag = {
        value: string;
      };

      export * as Foo from "./Base/Foo.js"
      export * as Other from "./Base/Other.js";
    `,
  );
});

it("directory structure", async () => {
  const { Base, program } = await runner.compile(t.code`
    namespace ${t.namespace("Base")} {
      model Pet {
        name: string;
      }
      @get
      @route("/pet/{petId}")
      op getPet(@path petId: int32): Pet;
      @delete
      @route("/pet/{petId}")
      op deletePet(@path petId: int32): {
        @statusCode _: 204;
      };

      model Tag {
        value: string;
      }
      namespace Foo {
        model Bar {
          name: string;
        }
        interface Buzz {
          @get
          @route("/pets")
          op listPets(): Pet[];
        }
      }
      namespace Other {
        model More {
          name: string;
        }
        namespace Here {
          model There {
            name: string;
          }
          namespace Everywhere {
            model Where {
              location?: string;
            }
          }
        }
      }
    }
  `);

  const res = render(
    <Output program={program}>
      <NamespaceStructure name="Base" ns={Base} />
    </Output>,
  );

  assertFileContents(res, {
    "Base.ts": `
      export type Pet = {
        name: string;
      };
      export type Tag = {
        value: string;
      };

      export const getPet = {
        operationId: "getPet",
        method: "GET",
        path: "/pet/{petId}",
        response: {
          "200": {
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
        headers?: never;
        content: {
          name: string;
        };
      };
      export const deletePet = {
        operationId: "deletePet",
        method: "DELETE",
        path: "/pet/{petId}",
        response: {
          "204": {
            headers: [],
            contentTypes: [],
          },
        },
      };
      export type DeletePetRequest = {
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
      export type DeletePetResponse = {
        statusCode: 204;
        headers?: never;
        content?: never;
      };
      export type OperationMap = {
        getPet: {
          request: GetPetRequest;
          response: GetPetResponse;
        };
        deletePet: {
          request: DeletePetRequest;
          response: DeletePetResponse;
        };
      };

      export * as Foo from "./Base/Foo.js"
      export * as Other from "./Base/Other.js";
    `,
    "Base/Foo.ts": `
      export type Bar = {
        name: string;
      };

      export * as Buzz from "./Foo/Buzz.js";
    `,
    "Base/Foo/Buzz.ts": `
      export const listPets = {
        operationId: "listPets",
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
          name: string;
        }[];
      };
      export type OperationMap = {
        listPets: {
          request: ListPetsRequest;
          response: ListPetsResponse;
        };
      };
    `,
    "Base/Other.ts": `
      export type More = {
        name: string;
      };

      export * as Here from "./Other/Here.js";
    `,
    "Base/Other/Here.ts": `
      export type There = {
        name: string;
      };

      export * as Everywhere from "./Here/Everywhere.js";
    `,
    "Base/Other/Here/Everywhere.ts": `
      export type Where = {
        location?: string;
      };
    `,
  });
});

it("Global namespace", async () => {
  const { program } = await runner.compile(t.code`
    model Tag {
      value: string;
    }
    namespace Foo {
      model Bar {
        name: string;
      }
    }
  `);

  const res = render(
    <Output program={program}>
      <NamespaceStructure name="Spec" ns={program.getGlobalNamespaceType()} />
    </Output>,
  );

  assertFileContents(res, {
    "Spec.ts": `
      export type Tag = {
        value: string;
      };

      export * as Foo from "./Spec/Foo.js";
    `,
    "Spec/Foo.ts": `
      export type Bar = {
        name: string;
      };
    `,
  });
});
