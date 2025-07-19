import { type Children } from '@alloy-js/core';
import { SourceFile, tsNameConflictResolver } from '@alloy-js/typescript';
import { resolvePath, type Program } from '@typespec/compiler';
import { createTester } from '@typespec/compiler/testing';
import { Output } from '@typespec/emitter-framework';
import { expect } from 'vitest';
import { createTSNamePolicy } from '../src/name-policy.js';

export const Tester = createTester(resolvePath(import.meta.dirname, '..'), {
  libraries: ['@typespec/http', '@typespec/rest', '@typespec/openapi'],
})
  .importLibraries()
  .using('Http', 'Rest', 'OpenAPI');

export function expectRender(
  program: Program,
  children: Children,
  expected: string,
) {
  const tsNamePolicy = createTSNamePolicy();

  expect(
    <Output
      program={program}
      namePolicy={tsNamePolicy}
      nameConflictResolver={tsNameConflictResolver}
    >
      <SourceFile path="test.ts">{children}</SourceFile>
    </Output>,
  ).toRenderTo(expected);
}
