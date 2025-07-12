import * as ay from '@alloy-js/core';
import * as ts from '@alloy-js/typescript';
import {
  EmitContext,
  ListenerFlow,
  navigateProgram,
  Program,
  Operation,
} from '@typespec/compiler';
import { $ } from '@typespec/compiler/typekit';
import { Output, writeOutput } from '@typespec/emitter-framework';
import { OperationDeclaration } from './components/OperationDeclaration.jsx';

export async function $onEmit(context: EmitContext) {
  const operations = getAllOperations(context.program);
  const tsNamePolicy = ts.createTSNamePolicy();

  writeOutput(
    context.program,
    <Output program={context.program} namePolicy={tsNamePolicy}>
      <ay.For each={operations}>
        {(operation) => (
          <ts.SourceFile path={`api/operations/${operation.name}.ts`}>
            <OperationDeclaration
              operation={operation}
              program={context.program}
            />
          </ts.SourceFile>
        )}
      </ay.For>
    </Output>,
    context.emitterOutputDir,
  );
}

/**
 * Collects all user-defined operations from the TypeSpec program
 * Filters out built-in library operations and focuses on API definitions
 */
function getAllOperations(program: Program): Operation[] {
  const operations: Operation[] = [];

  /**
   * Collects operations that have valid names for code generation
   */
  function collectOperation(operation: Operation) {
    if (operation.name) {
      operations.push(operation);
    }
  }

  const globalNs = program.getGlobalNamespaceType();

  // Navigate the program to find all operations, excluding built-in libraries
  navigateProgram(
    program,
    {
      namespace(namespace) {
        // Skip built-in namespaces to avoid generating code for library types
        if (
          namespace !== globalNs &&
          !$(program).type.isUserDefined(namespace)
        ) {
          return ListenerFlow.NoRecursion;
        }
      },
      operation: collectOperation,
    },
    { includeTemplateDeclaration: false },
  );

  return operations;
}
