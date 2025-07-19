import { type Operation } from '@typespec/compiler';
import { it } from 'vitest';
import { OperationDeclaration } from '../src/components/operation-declaration.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('simple operation', async () => {
  const runner = await createTestRunner();
  const { getPet } = (await runner.compile(`
    namespace Base {
      model Tag {
        value: string;
      }
    }

    model TagWithLabel {
      label: string;
      value: string;
    }

    model Pet {
      id: int32;
      name: string;
      tag?: Base.Tag | TagWithLabel;
      status: "available" | "pending" | "sold";
    }

    @route("/pets")
    interface Pets {
      @test
      @get getPet(@path petId: int32): {
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
  `)) as Record<string, Operation>;

  expectRender(runner.program, <OperationDeclaration op={getPet} />, '"hello"');
});
