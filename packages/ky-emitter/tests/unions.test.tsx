import { beforeEach, it } from "vitest";
import { TsSchema } from "../src/components/ts-schema.jsx";
import { Tester, expectRender } from "./utils.jsx";
import { t, type TesterInstance } from "@typespec/compiler/testing";

let runner: TesterInstance;

beforeEach(async () => {
  runner = await Tester.createInstance();
});

it("works with non-discriminated unions", async () => {
  const { Test } = await runner.compile(t.code`
    union ${t.union("Test")} {
      one: { oneItem: true },
      two: true
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Test} />,
    `
      {
        oneItem: true;
      } | true
    `,
  );
});

it("works with string literal unions", async () => {
  const { Status } = await runner.compile(t.code`
    union ${t.union("Status")} {
      available: "available",
      pending: "pending", 
      sold: "sold"
    }
  `);

  expectRender(
    runner.program,
    <TsSchema type={Status} />,
    '"available" | "pending" | "sold"',
  );
});
