import { Operation } from '@typespec/compiler';
import { it } from 'vitest';
import { OperationDeclaration } from '../src/components/operation-declaration.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('simple operation', async () => {
  const runner = await createTestRunner();
  const { getPet } = (await runner.compile(`
    model Pet {
      id: int32;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    }

    @route("/pets")
    interface Pets {
      @test
      @get getPet(@path petId: int32): Pet;
    }
  `)) as Record<string, Operation>;

  expectRender(runner.program, <OperationDeclaration op={getPet} />, '"hello"');
});
