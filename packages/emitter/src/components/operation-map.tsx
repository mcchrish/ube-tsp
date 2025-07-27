import { For } from '@alloy-js/core';
import { StatementList } from '@alloy-js/core/stc';
import {
  InterfaceExpression,
  InterfaceMember,
  ObjectExpression,
  ObjectProperty,
  TypeDeclaration,
  VarDeclaration,
} from '@alloy-js/typescript';
import type { Interface, Namespace, Operation } from '@typespec/compiler';
import type { Typekit } from '@typespec/compiler/typekit';
import { useTsp } from '@typespec/emitter-framework';
import { createRequestModel } from '../parts/request.js';
import { createResponseModel } from '../parts/response.js';
import { getOpNamespacePath, OperationObjectExpression } from './operation.jsx';
import { TsSchema } from './ts-schema.jsx';

interface OperationMapProps {
  ns: Namespace;
}
export function OperationMap({ ns }: OperationMapProps) {
  const { $ } = useTsp();
  const operations = getOperations($, ns);

  return (
    <>
      <StatementList>
        <VarDeclaration name="operationMap" const export>
          <OperationObjectMap operations={operations} />
        </VarDeclaration>
      </StatementList>
      {'\n'}
      <TypeDeclaration name="OperationMap" export>
        <InterfaceExpression>
          <OperationTypeMap operations={operations} />
        </InterfaceExpression>
      </TypeDeclaration>
    </>
  );
}

interface Props {
  operations: Operation[];
}
function OperationObjectMap({ operations }: Props) {
  return (
    <ObjectExpression>
      <For each={operations} comma hardline enderPunctuation>
        {(op) => {
          const nsPath = getOpNamespacePath(op);
          return (
            <ObjectProperty name={nsPath}>
              <OperationObjectExpression op={op} />
            </ObjectProperty>
          );
        }}
      </For>
    </ObjectExpression>
  );
}

interface Props {
  operations: Operation[];
}
function OperationTypeMap({ operations }: Props) {
  const { $ } = useTsp();
  return (
    <For each={operations} semicolon hardline enderPunctuation>
      {(op) => {
        const nsPath = getOpNamespacePath(op);
        return (
          <InterfaceMember
            name={nsPath}
            type={
              <InterfaceExpression>
                <StatementList>
                  <InterfaceMember
                    name="request"
                    type={<TsSchema type={createRequestModel($, op)} />}
                  />
                  <InterfaceMember
                    name="response"
                    type={
                      <TsSchema
                        type={createResponseModel($, $.httpOperation.get(op))}
                      />
                    }
                  />
                </StatementList>
              </InterfaceExpression>
            }
          />
        );
      }}
    </For>
  );
}

function getOperations($: Typekit, ns: Namespace | Interface): Operation[] {
  return [
    ...ns.operations.values(),
    ...('namespaces' in ns
      ? [
          ...[...ns.namespaces.values()].flatMap((ns) =>
            $.type.isUserDefined(ns) ? getOperations($, ns) : [],
          ),
          ...[...ns.interfaces.values()].flatMap((inter) =>
            $.type.isUserDefined(inter) ? getOperations($, inter) : [],
          ),
        ]
      : []),
  ];
}
