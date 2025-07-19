import { beforeEach, it } from 'vitest';
import { OperationDeclaration } from '../src/components/operation-declaration.jsx';
import { expectRender, Tester } from './utils.jsx';
import { t, type TesterInstance } from '@typespec/compiler/testing';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('complex', async () => {
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
      @get ${t.op('getPet')}(@path petId: int32): {
        @statusCode statusCode: 200;
        @header
        "x-extra-key": string;
        @body body: Pet;
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
    <OperationDeclaration op={getPet} />,
    `
      export const getPet = {
        method: 'GET',
        path: '/pets/{petId}',
      } as const;
      export type GetPet = {
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
          };
        } | {
          statusCode: 200;
          contentType: "application/json";
          content: string;
        } | {
          statusCode: "4XX";
          contentType: "application/json";
          content: {
            prop: {
              value: string;
            };
          };
        } | {
          statusCode: "5XX";
          contentType: "application/json";
          content: {
            prop: {
              value: string;
            };
          };
        };
      };
    `,
  );
});

it('default response', async () => {
  const { getPet } = await runner.compile(t.code`
    @defaultResponse
    model Pet {
      id: int32;
      name: string;
    }

    @route("/pets")
    interface Pets {
      @get ${t.op('getPet')}(@path petId: int32): Pet;
    }
  `);

  expectRender(
    runner.program,
    <OperationDeclaration op={getPet} />,
    `
      export const getPet = {
        method: 'GET',
        path: '/pets/{petId}',
      } as const;
      export type GetPet = {
        request: {
          parameters: {
            path: {
              petId: number
            };
          };
        };
        response: {
          statusCode: "default";
          contentType: "application/json";
          content: {
            id: number;
            name: string;
          };
        };
      };
    `,
  );
});
