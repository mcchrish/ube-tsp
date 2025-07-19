// import { List, StatementList } from '@alloy-js/core';
import { d } from '@alloy-js/core/testing';
import { type ModelProperty } from '@typespec/compiler';
import { it } from 'vitest';
import { TsSchema } from '../src/components/ts-schema.jsx';
import { createTestRunner, expectRender } from './utils.jsx';

it('works with basic models', async () => {
  const runner = await createTestRunner();
  const { Test } = (await runner.compile(`
    @test model Test {
      stringProp: string,
      optionalStringProp?: string
    }
  `)) as Record<string, ModelProperty>;

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        stringProp: string;
        optionalStringProp?: string;
      }
    `,
  );
});

it('works with models with basic constraints', async () => {
  const runner = await createTestRunner();
  const { Test } = (await runner.compile(`
    @test model Test {
      @maxLength(10)
      stringProp: string,

      @minValue(10)
      numberProp: float64
    }
  `)) as Record<string, ModelProperty>;

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        stringProp: string;
        numberProp: number;
      }
    `,
  );
});

it('works with records', async () => {
  const runner = await createTestRunner();
  const { Test, Test2 } = (await runner.compile(`
    @test model Test {
      ... Record<string>
    }

    @test model Test2 extends Record<string> {}
  `)) as Record<string, ModelProperty>;

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
Record<string, string>
    `,
  );

  expectRender(
    runner.program,
    <TsSchema type={Test2} />,
    d`
Record<string, string>
    `,
  );
});

it('works with records with properties', async () => {
  const runner = await createTestRunner();
  const { Test } = await runner.compile(`
    @test model Test {
      prop: "hi",
      ... Record<float64>
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        prop: "hi";
      } & Record<string, number>
    `,
  );
});

it('works with nested objects', async () => {
  const runner = await createTestRunner();
  const { Test } = await runner.compile(`
    @test model Test {
      prop: {
        nested: true
      }
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        prop: {
          nested: true;
        };
      }
    `,
  );
});

// it('works with referencing other schema declarations in members', async () => {
//   const runner = await createTestRunner();
//   const { mystring, Test } = await runner.compile(`
//     @test scalar mystring extends string;
//
//     @test model Test {
//       @maxLength(2)
//       prop: mystring
//     }
//   `);
//
//   expectRender(
//     runner.program,
//     <StatementList>
//       <ZodSchemaDeclaration type={mystring} />
//       <ZodSchemaDeclaration type={Test} />
//     </StatementList>,
//     d`
//       const mystring = z.string();
//       const Test = z.object({
//         prop: mystring.max(2),
//       });
//     `,
//   );
// });

// it('allows name to be a getter', async () => {
//   const runner = await createTestRunner();
//   const { Test } = await runner.compile(`
//     @test model Test {
//       @maxLength(2)
//       prop: string
//     }
//   `);
//
//   function getName() {
//     return 'hello' + 'there';
//   }
//   expectRender(
//     runner.program,
//     <StatementList>
//       <ZodSchemaDeclaration type={Test} name={getName()} />
//     </StatementList>,
//     d`
//       const hellothere = z.object({
//         prop: z.string().max(2),
//       });
//     `,
//   );
// });

it.skip('renders model and property docs', async () => {
  const runner = await createTestRunner();
  const { Test } = await runner.compile(`
    /**
     * This is an awesome model! It does things
     * that are interesting.
     **/
    @test model Test {
      /**
       * This is a property. It is also
       * interesting.
       **/
      @maxLength(2)
      prop: string
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      /**
       * This is an awesome model! It does things that are interesting.
       */
      {
        /**
         * maxLength: 2
         * This is a property. It is also interesting.
         */
        prop: string;
      }
    `,
  );
});

it('works with arrays', async () => {
  const runner = await createTestRunner();
  const { scalarArray, scalarArray2, modelArray } = (await runner.compile(`
    model Test {
      @test scalarArray: string[];
      @test scalarArray2: string[][];
      @test modelArray: {x: string, y: string}[];
    }
  `)) as Record<string, ModelProperty>;

  expectRender(
    runner.program,
    <TsSchema type={scalarArray.type} />,
    'string[]',
  );
  expectRender(
    runner.program,
    <TsSchema type={scalarArray2.type} />,
    'string[][]',
  );
  expectRender(
    runner.program,
    <TsSchema type={modelArray.type} />,
    d`
      {
        x: string;
        y: string;
      }[]
    `,
  );
});

it('works with model properties with array constraints', async () => {
  const runner = await createTestRunner();
  const { Test } = await runner.compile(`
    @test model Test {
      @maxItems(2)
      prop: string[]
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        prop: string[];
      }
    `,
  );
});

it('works with array declarations', async () => {
  const runner = await createTestRunner();
  const { Test } = await runner.compile(`
    @maxItems(5)
    @test model Test is Array<string>{}
  `);

  expectRender(runner.program, <TsSchema type={Test} />, 'string[]');
});

it('handles references', async () => {
  const runner = await createTestRunner();
  const { Test, Test2, Item } = await runner.compile(`
    @test model Item {
      prop: string;
    };

    /** Simple array */
    @test model Test is Array<Item>{}

    @test model Test2 {
      /** single array */
      prop1: Item[],

      /** nested array */
      @maxItems(5)
      prop2: Item[][],
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Item} />,
    d`
      {
        prop: string;
      }
    `,
  );
  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        prop: string;
      }[]
    `,
  );
  expectRender(
    runner.program,
    <TsSchema type={Test2} />,
    d`
      {
        prop1: {
          prop: string;
        }[];
        prop2: {
          prop: string;
        }[][];
      }
    `,
  );
});

it('makes default optional', async () => {
  const runner = await createTestRunner();
  const { Test } = await runner.compile(`
    @test model Test {
      number: float64 = 5;
      string: string = "hello";
      boolean: boolean = true;
      array: string[] = #["hello"];
      null: null = null;
      dateTime: utcDateTime = utcDateTime.fromISO("2025-01-01T00:00:00Z");
      offsetDateTime: offsetDateTime = offsetDateTime.fromISO("2025-01-01T00:00:00+01:00");
      plainTime: plainTime = plainTime.fromISO("10:01:00");
      plainDate: plainDate = plainDate.fromISO("2025-01-01");
      duration: duration = duration.fromISO("P1Y2M3DT4H5M6S");
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      {
        /**
         * @defaultValue \`5\`
         */
        number?: number;
        /**
         * @defaultValue \`"hello"\`
         */
        string?: string;
        /**
         * @defaultValue \`true\`
         */
        boolean?: boolean;
        /**
         * @defaultValue \`["hello"]\`
         */
        array?: string[];
        /**
         * @defaultValue \`null\`
         */
        null_?: null;
        /**
         * @defaultValue \`"2025-01-01T00:00:00Z"\`
         */
        dateTime?: string;
        /**
         * @defaultValue \`"2025-01-01T00:00:00+01:00"\`
         */
        offsetDateTime?: string;
        /**
         * @defaultValue \`"10:01:00"\`
         */
        plainTime?: string;
        /**
         * @defaultValue \`"2025-01-01"\`
         */
        plainDate?: string;
        /**
         * @defaultValue \`"P1Y2M3DT4H5M6S"\`
         */
        duration?: string;
      }
    `,
  );
});

// it('supports model extends', async () => {
//   const runner = await createTestRunner();
//   const { Point2D, Point3D } = await runner.compile(`
//     @test model Point2D {
//       x: float64,
//       y: float64
//     }
//
//     @test model Point3D extends Point2D {
//       z: float64
//     }
//   `);
//
//   expectRender(
//     runner.program,
//     <List>
//       <ZodSchemaDeclaration type={Point2D} />
//       <ZodSchemaDeclaration type={Point3D} />
//     </List>,
//     d`
//       const Point2D = z.object({
//         x: z.number(),
//         y: z.number(),
//       })
//       const Point3D = Point2D.merge(z.object({
//         z: z.number(),
//       }))
//     `,
//   );
// });

// this will require some sophistication (i.e. cycle detection)
it.skip('works with circular references', async () => {
  const runner = await createTestRunner();
  const { Test } = await runner.compile(`
    @test model Test {
      prop: Test
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    d`
      z.object({
        prop: z.lazy(() => Test),
      })
    `,
  );
});
