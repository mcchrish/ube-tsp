import { d } from '@alloy-js/core/testing';
import { type ModelProperty } from '@typespec/compiler';
import { it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('works', async () => {
  const runner = await createTestRunner();
  const { Test } = (await runner.compile(`
    @test model Ref {
      prop: string;
    }

    model Container {
      @test Test: ["one", { a: 1, b: 2 }, Ref];
    }
  `)) as Record<string, ModelProperty>;

  expectRender(
    runner.program,
    <TsSchema type={Test.type} />,
    d`
      [
        "one",
        {
          a: 1;
          b: 2;
        },
        {
          prop: string;
        }
      ]
    `,
  );
});
