import { beforeEach, it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { Tester, expectRender } from './utils.jsx';
import { t, type TesterInstance } from '@typespec/compiler/testing';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('works with intrinsics', async () => {
  const { nullProp, neverProp, unknownProp, voidProp } =
    await runner.compile(t.code`
    model Test {
      ${t.modelProperty('nullProp')}: null,
      ${t.modelProperty('neverProp')}: never,
      ${t.modelProperty('unknownProp')}: unknown,
      ${t.modelProperty('voidProp')}: void,
    }
  `);

  expectRender(runner.program, <TsSchema type={nullProp.type} />, 'null');
  expectRender(runner.program, <TsSchema type={neverProp.type} />, 'never');
  expectRender(runner.program, <TsSchema type={unknownProp.type} />, 'unknown');
  expectRender(runner.program, <TsSchema type={voidProp.type} />, 'void');
});
