import { render, type Children, type OutputDirectory, type OutputFile, type PrintTreeOptions } from "@alloy-js/core";
import { dedent } from "@alloy-js/core/testing";
import { SourceFile, tsNameConflictResolver } from "@alloy-js/typescript";
import { resolvePath, type Program } from "@typespec/compiler";
import { createTester } from "@typespec/compiler/testing";
import { Output } from "@typespec/emitter-framework";
import "@typespec/http/experimental/typekit";
import { expect } from "vitest";
import { createTSNamePolicy } from "../src/name-policy.js";

export const Tester = createTester(resolvePath(import.meta.dirname, ".."), {
  libraries: ["@typespec/http", "@typespec/openapi"],
})
  .importLibraries()
  .using("Http", "OpenAPI");

export function expectRender(program: Program, children: Children, expected: string) {
  const tsNamePolicy = createTSNamePolicy();

  expect(
    <Output program={program} namePolicy={tsNamePolicy} nameConflictResolver={tsNameConflictResolver}>
      <SourceFile path="test.ts">{children}</SourceFile>
    </Output>,
  ).toRenderTo(expected);
}

export function toSourceText(program: Program, c: Children, options?: PrintTreeOptions): string {
  const res = render(
    <Output program={program}>
      <SourceFile path="test.ts">{c}</SourceFile>
    </Output>,
    options,
  );

  const file = res.contents[0];
  if (file?.kind === "file" && "contents" in file) {
    return file.contents as string;
  }
  throw new Error("Expected a source file with contents");
}

export function findFile(res: OutputDirectory, path: string): OutputFile {
  const result = findFileWorker(res, path);

  if (!result) {
    throw new Error("Expected to find file " + path);
  }
  return result;

  function findFileWorker(res: OutputDirectory, path: string): OutputFile | null {
    for (const item of res.contents) {
      if (item.kind === "file") {
        if (item.path === path) {
          return item;
        }
        continue;
      } else {
        const found = findFileWorker(item, path);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

export function assertFileContents(res: OutputDirectory, expectedFiles: Record<string, string>) {
  for (const [path, contents] of Object.entries(expectedFiles)) {
    const file = findFile(res, path);
    if (!("contents" in file)) {
      throw new Error(`Expected file ${path} to have contents`);
    }
    expect(file.contents).toBe(dedent(contents));
  }
}
