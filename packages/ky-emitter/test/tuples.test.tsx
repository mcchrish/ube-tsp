import { beforeEach, it } from "vitest";
import { TsSchema } from "../src/components/ts-schema.jsx";
import { Tester, expectRender } from "./utils.jsx";
import { t, type TesterInstance } from "@typespec/compiler/testing";

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it("works", async () => {
  const { Test } = await runner.compile(t.code`
    model Ref {
      prop: string;
    }

    model Container {
      ${t.modelProperty("Test")}: ["one", { a: 1, b: 2 }, Ref];
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test.type} />,
    `
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
