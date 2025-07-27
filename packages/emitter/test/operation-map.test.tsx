import { t, type TesterInstance } from '@typespec/compiler/testing';
import { beforeEach, it } from 'vitest';
import { OperationMap } from '../src/components/operation-map.jsx';
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
            op listPet(): Pet[];
          }
        }
      }
    }
  `);

  expectRender(
    runner.program,
    <OperationMap ns={Base} />,
    `
      export const operationMap = {
        "Base.getPet": {
          operationId: "getPet",
          method: "GET",
          path: "/pets/{petId}",
          statusCodes: [200],
        },
        "Base.Foo.Bar.Buzz.listPet": {
          operationId: "listPet",
          method: "GET",
          path: "/pets",
          statusCodes: [200],
        },
      };
      export type OperationMap = {
        "Base.getPet": {
          request: {
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
          response: {
            statusCode: 200;
            contentType: "application/json";
            headers?: never;
            content: {
              name: string;
            };
          };
        };
        "Base.Foo.Bar.Buzz.listPet": {
          request: {
            params?: never;
            body?: never;
          };
          response: {
            statusCode: 200;
            contentType: "application/json";
            headers?: never;
            content: {
              name: string;
            }[];
          };
        };
      };
    `,
  );
});
