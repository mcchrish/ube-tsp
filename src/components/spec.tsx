import { For } from '@alloy-js/core';
import {
  InterfaceExpression,
  InterfaceMember,
  ObjectExpression,
  ObjectProperty,
  TypeDeclaration,
  VarDeclaration,
} from '@alloy-js/typescript';
import {
  getNamespaceFullName,
  navigateProgram,
  type Interface,
  type Namespace,
  type Operation,
} from '@typespec/compiler';
import {
  OperationObjectExpression,
  OperationTypeExpression,
} from './operation.jsx';
import { useTsp } from '@typespec/emitter-framework';
import type { Typekit } from '@typespec/compiler/typekit';
import { StatementList } from '@alloy-js/core/stc';

export function Spec() {
  const { $ } = useTsp();
  const ops = getAllOperations($);
  const globalNs = $.program.getGlobalNamespaceType();
  return (
    <>
      <StatementList>
        <VarDeclaration name="spec" const export>
          <ObjectExpression>
            <For each={ops} comma hardline enderPunctuation>
              {(op) => {
                const interfaceName = op.interface
                  ? `${op.interface.name}.${op.name}`
                  : op.name;
                const name =
                  !op.namespace || op.namespace === globalNs
                    ? interfaceName
                    : `${getNamespaceFullName(op.namespace)}.${interfaceName}`;
                return (
                  <ObjectProperty
                    name={name}
                    value={<OperationObjectExpression op={op} />}
                  />
                );
              }}
            </For>
          </ObjectExpression>
          {' as const'}
        </VarDeclaration>
      </StatementList>
      {'\n'}
      <TypeDeclaration name="Spec" export>
        <NamespaceType ns={globalNs} />
      </TypeDeclaration>
    </>
  );
}

export function NamespaceType({ ns }: { ns: Namespace | Interface }) {
  const { $ } = useTsp();
  const nestedNamespaces = (
    'namespaces' in ns
      ? [...ns.namespaces.values(), ...ns.interfaces.values()]
      : []
  ).filter((ns) => $.type.isUserDefined(ns));
  const ops = [...ns.operations.values()].filter((op) =>
    $.type.isUserDefined(op),
  );
  return (
    <InterfaceExpression>
      <For each={ops} semicolon hardline enderPunctuation>
        {(op) => (
          <InterfaceMember name={op.name}>
            <OperationTypeExpression op={op} />
          </InterfaceMember>
        )}
      </For>
      <For each={nestedNamespaces} semicolon hardline enderPunctuation>
        {(ns) => (
          <InterfaceMember name={ns.name}>
            <NamespaceType ns={ns} />
          </InterfaceMember>
        )}
      </For>
    </InterfaceExpression>
  );
}

/**
 * Collects all user-defined operations from the TypeSpec program
 * Filters out built-in library operations and focuses on API definitions
 */
function getAllOperations($: Typekit): Operation[] {
  const program = $.program;
  const operations: Operation[] = [];

  /**
   * Collects operations that have valid names for code generation
   */
  function collectOperation(operation: Operation) {
    if (operation.name) {
      operations.push(operation);
    }
  }

  // Navigate the program to find all operations, excluding built-in libraries
  navigateProgram(
    program,
    {
      operation: collectOperation,
    },
    { includeTemplateDeclaration: false },
  );

  return operations;
}
