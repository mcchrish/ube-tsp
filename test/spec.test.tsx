import { beforeEach, it } from 'vitest';
import { expectRender, Tester } from './utils.jsx';
import { t, type TesterInstance } from '@typespec/compiler/testing';
import { Spec } from '../src/components/spec.jsx';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('Base namespace', async () => {
  await runner.compile(t.code`
    namespace Base;
    model Pet { name: string; }
    @get
    @route("/pets")
    op getPet(@path petId: int32): Pet;
  `);

  expectRender(
    runner.program,
    <Spec />,
    `
      export const spec = {
        "Base.getPet": {
          operationId: 'getPet',
          method: 'GET',
          path: '/pets/{petId}',
        },
      } as const;
      export type Spec = {
        Base: {
          getPet: {
            request: {
              parameters: {
                path: {
                  petId: number
                };
              };
            };
            response: {
              statusCode: 200;
              contentType: "application/json";
              content: {
                name: string;
              };
            };
          };
        };
      };
    `,
  );
});

it('Global namespace', async () => {
  await runner.compile(t.code`
    model Pet { name: string; }

    @get
    @route("/pets")
    op getPet(@path petId: int32): Pet;
  `);

  expectRender(
    runner.program,
    <Spec />,
    `
      export const spec = {
        getPet: {
          operationId: 'getPet',
          method: 'GET',
          path: '/pets/{petId}',
        },
      } as const;
      export type Spec = {
        getPet: {
          request: {
            parameters: {
              path: {
                petId: number
              };
            };
          };
          response: {
            statusCode: 200;
            contentType: "application/json";
            content: {
              name: string;
            };
          };
        };
      };
    `,
  );
});

it('Nested namespace', async () => {
  await runner.compile(t.code`
    namespace Base {
      model Pet { name: string; }
      namespace Nested {
        @get
        @route("/pets")
        op getPet(@path petId: int32): Pet;
      }
    }
  `);

  expectRender(
    runner.program,
    <Spec />,
    `
      export const spec = {
        "Base.Nested.getPet": {
          operationId: 'getPet',
          method: 'GET',
          path: '/pets/{petId}',
        },
      } as const;
      export type Spec = {
        Base: {
          Nested: {
            getPet: {
              request: {
                parameters: {
                  path: {
                    petId: number
                  };
                };
              };
              response: {
                statusCode: 200;
                contentType: "application/json";
                content: {
                  name: string;
                };
              };
            };
          };
        };
      };
    `,
  );
});

it('Include interface', async () => {
  await runner.compile(t.code`
    namespace Base {
      model Pet { name: string; }
      interface Pets {
        @get
        @route("/pets")
        op getPet(@path petId: int32): Pet;
      }
    }
  `);

  expectRender(
    runner.program,
    <Spec />,
    `
      export const spec = {
        "Base.Pets.getPet": {
          operationId: 'getPet',
          method: 'GET',
          path: '/pets/{petId}',
        },
      } as const;
      export type Spec = {
        Base: {
          Pets: {
            getPet: {
              request: {
                parameters: {
                  path: {
                    petId: number
                  };
                };
              };
              response: {
                statusCode: 200;
                contentType: "application/json";
                content: {
                  name: string;
                };
              };
            };
          };
        };
      };
    `,
  );
});
