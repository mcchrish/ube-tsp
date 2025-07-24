import { render } from '@alloy-js/core';
import { t, type TesterInstance } from '@typespec/compiler/testing';
import { Output } from '@typespec/emitter-framework';
import { beforeEach, it } from 'vitest';
import {
  NamespaceContent,
  NamespaceStructure,
} from '../src/components/namespace.jsx';
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

      export * as Foo from "./Base/Foo.js"
      export * as Other from "./Base/Other.js";
    `,
  );
});

it('directory structure', async () => {
  const { Base, program } = await runner.compile(t.code`
    @get
    op getPet(): void;
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
          where?: Here.Everywhere.Where;
        }
        namespace Here {
          model There {
            name: string;
          }
          namespace Everywhere {
            model Where {
              location?: string;
            }
          }
        }
      }
    }
  `);

  const res = render(
    <Output program={program}>
      <NamespaceStructure ns={Base} />
    </Output>,
  );

  assertFileContents(res, {
    'Base.ts': `
      export type Tag = {
        value: string;
      };

      export * as Foo from "./Base/Foo.js"
      export * as Other from "./Base/Other.js";
    `,
    'Base/Foo.ts': `
      export type Bar = {
        name: string;
      };
    `,
    'Base/Other.ts': `
      export type More = {
        name: string;
      };

      export * as Here from "./Other/Here.js";
    `,
    'Base/Other/Here.ts': `
      export type There = {
        name: string;
      };

      export * as Everywhere from "./Here/Everywhere.js";
    `,
    'Base/Other/Here/Everywhere.ts': `
      export type Where = {
        location?: string;
      };
    `,
  });
});
