import { beforeEach, it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { Tester, expectRender } from './utils.jsx';
import { t, type TesterInstance } from '@typespec/compiler/testing';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('works with no values', async () => {
  const { Test } = await runner.compile(t.code`
    enum ${t.enum('Test')} {
      A, B
    }
  `);

  expectRender(runner.program, <TsSchema type={Test} />, '"A" | "B"');
});

it('works with string values', async () => {
  const { Test } = await runner.compile(t.code`
    enum ${t.enum('Test')} {
      A: "a", B: "b"
    }
  `);

  expectRender(runner.program, <TsSchema type={Test} />, '"a" | "b"');
});

it('works with number values', async () => {
  const { Test } = await runner.compile(t.code`
    enum ${t.enum('Test')} {
      A: 1, B: 2
    }
  `);

  expectRender(runner.program, <TsSchema type={Test} />, '1 | 2');
});
