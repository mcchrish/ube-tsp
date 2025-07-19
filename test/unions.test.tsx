import { d } from '@alloy-js/core/testing';
import { type Union } from '@typespec/compiler';
import { it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('works with discriminated unions with envelope', async () => {
  const runner = await createTestRunner();
  const { Test } = (await runner.compile(`
    @discriminated
    @test union Test {
      one: { oneItem: true },
      two: true
    }
  `)) as Record<string, Union>;

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        kind: "one";
        value: {
          oneItem: true;
        };
      } | {
        kind: "two";
        value: true;
      }
    `,
  );
});

it('works with discriminated unions without envelope', async () => {
  const runner = await createTestRunner();
  const { Test } = (await runner.compile(`
    @discriminated(#{ envelope: "none" })
    @test union Test {
      one: { kind: "one", value: 1 };
      two: { kind: "two", value: 2 };
    }
  `)) as Record<string, Union>;

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        kind: "one";
        value: 1;
      } | {
        kind: "two";
        value: 2;
      }
    `,
  );
});

it('works with non-discriminated unions', async () => {
  const runner = await createTestRunner();
  const { Test } = (await runner.compile(`
    @test union Test {
      one: { oneItem: true },
      two: true
    }
  `)) as Record<string, Union>;

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        oneItem: true;
      } | true
    `,
  );
});

it('works with the unknown variant (by not emitting it)');
