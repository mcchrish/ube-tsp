import { beforeEach, it } from 'vitest';
import {
  OperationObjectExpression,
  OperationTypeExpression,
} from '../src/components/operation.jsx';
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
      @get
      op ${t.op('getPet')}(@path petId: int32): {
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
    <OperationObjectExpression op={getPet} />,
    `
      {
        operationId: 'getPet',
        method: 'GET',
        path: '/pets/{petId}',
      }
    `,
  );
  expectRender(
    runner.program,
    <OperationTypeExpression op={getPet} />,
    `
      {
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
      }
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
      @get
      op ${t.op('getPet')}(@path petId: int32): Pet;
    }
  `);

  expectRender(
    runner.program,
    <OperationObjectExpression op={getPet} />,
    `
      {
        operationId: 'getPet',
        method: 'GET',
        path: '/pets/{petId}',
      }
    `,
  );
  expectRender(
    runner.program,
    <OperationTypeExpression op={getPet} />,
    `
      {
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
      }
    `,
  );
});

it('@operationId', async () => {
  const { listPets } = await runner.compile(t.code`
    model Pet {
      id: int32;
      name: string;
    }

    @route("/pets")
    interface Pets {
      @operationId("listAllPets")
      @get
      op ${t.op('listPets')}(): Pet[];
    }
  `);

  expectRender(
    runner.program,
    <OperationObjectExpression op={listPets} />,
    `
      {
        operationId: 'listAllPets',
        method: 'GET',
        path: '/pets',
      }
    `,
  );
  expectRender(
    runner.program,
    <OperationTypeExpression op={listPets} />,
    `
      {
        request: {

        };
        response: {
          statusCode: 200;
          contentType: "application/json";
          content: {
            id: number;
            name: string;
          }[];
        };
      }
    `,
  );
});
