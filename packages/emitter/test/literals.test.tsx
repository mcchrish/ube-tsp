import { beforeEach, it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { Tester, expectRender } from './utils.jsx';
import { t, type TesterInstance } from '@typespec/compiler/testing';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('works with literals', async () => {
  const { stringProp, numberProp, booleanProp } = await runner.compile(t.code`
    model Test {
      ${t.modelProperty('stringProp')}: "hello",
      ${t.modelProperty('numberProp')}: 123,
      ${t.modelProperty('booleanProp')}: true,
    }
  `);

  expectRender(runner.program, <TsSchema type={stringProp.type} />, '"hello"');
  expectRender(runner.program, <TsSchema type={numberProp.type} />, '123');
  expectRender(runner.program, <TsSchema type={booleanProp.type} />, 'true');
});
