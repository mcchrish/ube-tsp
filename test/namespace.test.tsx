import { refkey, render } from '@alloy-js/core';
import { Reference, SourceFile } from '@alloy-js/typescript';
import { t, type TesterInstance } from '@typespec/compiler/testing';
import { Output } from '@typespec/emitter-framework';
import { FunctionDeclaration } from '@typespec/emitter-framework/typescript';
import { beforeEach, it } from 'vitest';
import { NamespaceContent } from '../src/components/namespace.jsx';
import { assertFileContents, expectRender, Tester } from './utils.jsx';

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it('complex', async () => {
  const { Base } = await runner.compile(t.code`
    namespace ${t.namespace('Base')} {
      model Tag {
        value: string;
      }
      namespace Foo {
        model Bar {
          name: string;
        }
      }
      namespace Other {
        model More {
          name: string;
        }
        namespace Here {
          model There {
            name: string;
          }
        }
      }
    }
  `);

  expectRender(
    runner.program,
    <NamespaceContent ns={Base} />,
    `
      export type Tag = {
        value: string;
      };

      export * as Foo from "./Foo.js";
    `,
  );
});

it('works with named imports', async () => {
  const { program } = await runner.compile(`
    enum Test {
      A, B
    }
  `);
  const res = render(
    <Output program={program}>
      <SourceFile path="test1.ts">
        <FunctionDeclaration export name="test" refkey={refkey('test')} />
      </SourceFile>

      <SourceFile path="test2.ts">
        const v = <Reference refkey={refkey('test')} />;
      </SourceFile>
    </Output>,
  );

  assertFileContents(res, {
    'test1.ts': `
      export function test() {}
    `,
    'test2.ts': `
      import { test } from "./test1.js";

      const v = test;
    `,
  });
});
