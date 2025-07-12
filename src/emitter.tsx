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
 * Collects all the operations defined in the spec
 */
function getAllOperations(program: Program): Operation[] {
  const operations: Operation[] = [];

  function collectOperation(operation: Operation) {
    if (operation.name) {
      operations.push(operation);
    }
  }

  const globalNs = program.getGlobalNamespaceType();

  navigateProgram(
    program,
    {
      namespace(n) {
        if (n !== globalNs && !$(program).type.isUserDefined(n)) {
          return ListenerFlow.NoRecursion;
        }
      },
      operation: collectOperation,
    },
    { includeTemplateDeclaration: false },
  );

  return operations;
}
