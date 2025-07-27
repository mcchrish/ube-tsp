import { t, type TesterInstance } from '@typespec/compiler/testing';
import { beforeEach, it } from 'vitest';
import {
  OperationMap,
  OperationTypeMap,
} from '../src/components/operation-map.jsx';
import { expectRender, Tester } from './utils.jsx';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('complex', async () => {
  const { Base } = await runner.compile(t.code`
    namespace ${t.namespace('Base')} {
      model Pet {
        name: string;
      }

      @get
      @route("/pets/{petId}")
      op getPet(@path petId: int32): Pet;

      namespace Foo {
        namespace Bar {
          interface Buzz {
            @get
            @route("/pets")
            op listPets(): Pet[];
          }
        }
      }
    }
  `);

  expectRender(
    runner.program,
    <OperationMap ns={Base} />,
    `
      import { type Options } from "ky";
      export const operationMap = {
        getPet: {
          operationId: "getPet",
          method: "GET",
          path: "/pets/{petId}",
          statusCodes: [200],
        },
        "Foo.Bar.Buzz.listPets": {
          operationId: "listPets",
          method: "GET",
          path: "/pets",
          statusCodes: [200],
        },
      };
      export type OperationMap = {
        getPet: (params: {
          params: {
            path: {
              petId: number;
            };
            query?: never;
            header?: never;
            cookie?: never;
          };
          body?: never;
        }, kyOptions?: Options) => Promise<{
          statusCode: 200;
          contentType: "application/json";
          headers?: never;
          content: {
            name: string;
          };
        }>;
        Foo: {
          Bar: {
            Buzz: {
              listPets: (params?: {
                params?: never;
                body?: never;
              }, kyOptions?: Options) => Promise<{
                statusCode: 200;
                contentType: "application/json";
                headers?: never;
                content: {
                  name: string;
                }[];
              }>;
            };
          };
        };
      };
    `,
  );
});

it('operation type map', async () => {
  const { Base } = await runner.compile(t.code`
    namespace ${t.namespace('Base')} {
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

  expectRender(
    runner.program,
    <OperationTypeMap ns={Base} />,
    `
      {
        getPet: (params: {
          params: {
            path: {
              petId: number;
            };
            query?: never;
            header?: never;
            cookie?: never;
          };
          body?: never;
        }, kyOptions?: Options) => Promise<{
          statusCode: 200;
          contentType: "application/json";
          headers?: never;
          content: {
            name: string;
          };
        }>;
        deletePet: (params: {
          params: {
            path: {
              petId: number;
            };
            query?: never;
            header?: never;
            cookie?: never;
          };
          body?: never;
        }, kyOptions?: Options) => Promise<{
          statusCode: 204;
          contentType?: never;
          headers?: never;
          content?: never;
        }>;
        Foo: {
          Buzz: {
            listPets: (params?: {
              params?: never;
              body?: never;
            }, kyOptions?: Options) => Promise<{
              statusCode: 200;
              contentType: "application/json";
              headers?: never;
              content: {
                name: string;
              }[];
            }>;
          };
        };
        Other: {
          Here: {
            Everywhere: never;
          };
        };
      }
    `,
  );
});
