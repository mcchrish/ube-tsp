import * as ay from "@alloy-js/core";
import * as ts from "@alloy-js/typescript";
import {
  EmitContext,
  ListenerFlow,
  navigateProgram,
  Program,
  Type,
  Model,
  Operation,
} from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { Output, writeOutput } from "@typespec/emitter-framework";
import { InterfaceDeclaration } from "./components/InterfaceDeclaration.jsx";
import { OperationDeclaration } from "./components/OperationDeclaration.jsx";
import { shouldReference } from "./utils.js";

export async function $onEmit(context: EmitContext) {
  const types = getAllTypes(context.program);
  const operations = getAllOperations(context.program);
  const tsNamePolicy = ts.createTSNamePolicy();

  writeOutput(
    context.program,
    <Output
      program={context.program}
      namePolicy={tsNamePolicy}
    >
      <ts.SourceFile path="api/schemas.ts">
        <ay.For each={types}>
          {(type) => <InterfaceDeclaration type={type} export />}
        </ay.For>
      </ts.SourceFile>

      <ay.For each={operations}>
        {(operation) => (
          <ts.SourceFile path={`api/operations/${operation.name}.ts`}>
            <OperationDeclaration operation={operation} program={context.program} />
          </ts.SourceFile>
        )}
      </ay.For>
    </Output>,
    context.emitterOutputDir,
  );
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