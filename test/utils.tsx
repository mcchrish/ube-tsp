import { type Children, render } from '@alloy-js/core';
import { SourceFile, tsNameConflictResolver } from '@alloy-js/typescript';
import { type Program } from '@typespec/compiler';
import { createTestHost, createTestWrapper } from '@typespec/compiler/testing';
import { Output } from '@typespec/emitter-framework';
import { HttpTestLibrary } from '@typespec/http/testing';
import { expect } from 'vitest';
import { createTSNamePolicy } from '../src/name-policy.js';
import { TypeScriptEmitterTestLibrary } from '../src/testing/index.js';

export function expectRender(
  program: Program,
  children: Children,
  expected: string,
) {
  const tsNamePolicy = createTSNamePolicy();

  const template = (
    <Output
      program={program}
      namePolicy={tsNamePolicy}
      nameConflictResolver={tsNameConflictResolver}
    >
      <SourceFile path="test.ts">{children}</SourceFile>
    </Output>
  );

  const output = render(template);

  expect(output.contents[0].contents as string).toBe(expected);
}

export async function createTestRunner() {
  const host = await createTestHost({
    libraries: [TypeScriptEmitterTestLibrary, HttpTestLibrary],
  });
  const importAndUsings = `import "@typespec/http"; using Http;\n`;
  return createTestWrapper(host, {
    wrapper: (code) => `${importAndUsings} ${code}`,
  });
}
