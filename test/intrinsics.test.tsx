import { type ModelProperty } from '@typespec/compiler';
import { it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('works with intrinsics', async () => {
  const runner = await createTestRunner();
  const { nullProp, neverProp, unknownProp, voidProp } = (await runner.compile(`
    model Test {
      @test
      nullProp: null,

      @test
      neverProp: never,

      @test
      unknownProp: unknown,

      @test
      voidProp: void,
    }
  `)) as Record<string, ModelProperty>;

  expectRender(runner.program, <TsSchema type={nullProp.type} />, 'null');
  expectRender(runner.program, <TsSchema type={neverProp.type} />, 'never');
  expectRender(runner.program, <TsSchema type={unknownProp.type} />, 'unknown');
  expectRender(runner.program, <TsSchema type={voidProp.type} />, 'void');
});
