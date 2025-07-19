import { type ModelProperty } from '@typespec/compiler';
import { it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('works with literals', async () => {
  const runner = await createTestRunner();
  const { stringProp, numberProp, booleanProp } = (await runner.compile(`
    model Test {
      @test
      stringProp: "hello",

      @test
      numberProp: 123,

      @test
      booleanProp: true,
    }
  `)) as Record<string, ModelProperty>;

  expectRender(runner.program, <TsSchema type={stringProp.type} />, '"hello"');
  expectRender(runner.program, <TsSchema type={numberProp.type} />, '123');
  expectRender(runner.program, <TsSchema type={booleanProp.type} />, 'true');
});
