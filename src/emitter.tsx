import * as ay from '@alloy-js/core';
import { refkey, Refkey } from '@alloy-js/core';
import * as ts from '@alloy-js/typescript';
import {
  EmitContext,
  ListenerFlow,
  navigateProgram,
  Program,
  Type,
  Model,
  Operation,
} from '@typespec/compiler';
import { $ } from '@typespec/compiler/typekit';
import { Output, writeOutput } from '@typespec/emitter-framework';
import { InterfaceDeclaration } from './components/InterfaceDeclaration.jsx';
import { OperationDeclaration } from './components/OperationDeclaration.jsx';
import { shouldReference } from './utils.js';

export async function $onEmit(context: EmitContext) {
  const types = getAllTypes(context.program);
  const operations = getAllOperations(context.program);
  const tsNamePolicy = ts.createTSNamePolicy();

  // Create refkeys for types to enable cross-file references
  const typeRefkeys = new Map<string, Refkey>();
  types.forEach((type) => {
    const typeName = getTypeName(type);
    typeRefkeys.set(typeName, refkey('schemas', typeName));
  });

  writeOutput(
    context.program,
    <Output program={context.program} namePolicy={tsNamePolicy}>
      <ts.SourceFile path="api/schemas.ts">
        <ay.StatementList>
          <ay.For each={types}>
            {(type) => {
              const typeName = getTypeName(type);
              const refkey = typeRefkeys.get(typeName);
              return (
                <InterfaceDeclaration type={type} export refkey={refkey} />
              );
            }}
          </ay.For>
        </ay.StatementList>
      </ts.SourceFile>

      <ay.For each={operations}>
        {(operation) => (
          <ts.SourceFile path={`api/operations/${operation.name}.ts`}>
            <OperationDeclaration
              operation={operation}
              program={context.program}
              typeRefkeys={typeRefkeys}
            />
          </ts.SourceFile>
        )}
      </ay.For>
    </Output>,
    context.emitterOutputDir,
  );
}

// Helper function to get type name (duplicated from InterfaceDeclaration for now)
function getTypeName(type: Type): string {
  switch (type.kind) {
    case 'Model':
      return type.name || 'UnnamedModel';
    case 'Union':
      return type.name || 'UnnamedUnion';
    case 'Enum':
      return type.name || 'UnnamedEnum';
    case 'Scalar':
      return type.name || 'UnnamedScalar';
    default:
      return 'UnknownType';
  }
}

/**
 * Collects all the types defined in the spec
 */
function getAllTypes(program: Program): Type[] {
  const types: Type[] = [];

  function collectType(type: Type) {
    if (shouldReference(program, type)) {
      types.push(type);
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
      model: collectType,
      enum: collectType,
      union: collectType,
      scalar: collectType,
    },
    { includeTemplateDeclaration: false },
  );

  return types;
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
