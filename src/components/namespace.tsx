import {
  code,
  For,
  refkey,
  SourceDirectory,
  StatementList,
} from '@alloy-js/core';
import {
  FunctionDeclaration,
  SourceFile,
  TypeDeclaration,
  VarDeclaration,
} from '@alloy-js/typescript';
import {
  getNamespaceFullName,
  type Namespace,
  type Operation,
} from '@typespec/compiler';
import { TsSchema } from './ts-schema.jsx';
import { useTsp } from '@typespec/emitter-framework';
import { getOperationId } from '@typespec/openapi';
import { OperationObjectExpression } from './operation.jsx';
import { createRequestModel } from '../parts/request.jsx';
import { createResponseMember } from '../parts/response.jsx';

interface Props {
  ns: Namespace;
}
export function NamespaceContent({ ns }: Props) {
  return (
    <>
      <For each={ns.models}>
        {(name, model) => {
          return (
            <TypeDeclaration
              name={name}
              export
              refkey={refkey(`${getNamespaceFullName(ns)}.${name}`)}
            >
              <TsSchema type={model} rootNs={ns} />
            </TypeDeclaration>
          );
        }}
      </For>
      {ns.operations.size > 0 && (
        <>
          {'\n\n'}
          <For each={ns.operations} hardline>
            {(_, op) => <OperationPart op={op} />}
          </For>
        </>
      )}

      {ns.namespaces.size > 0 && (
        <>
          {'\n\n'}
          <StatementList>
            <For each={ns.namespaces}>
              {(name) =>
                code`export * as ${name} from "./${ns.name}/${name}.js"`
              }
            </For>
          </StatementList>
        </>
      )}
    </>
  );
}

export function NamespaceStructure({ ns }: { ns: Namespace; path?: string }) {
  return (
    <>
      <SourceFile path={`${ns.name}.ts`}>
        <NamespaceContent ns={ns} />
      </SourceFile>
      {ns.namespaces.size > 0 && (
        <SourceDirectory path={ns.name}>
          <For each={ns.namespaces}>
            {(_, childNs) => <NamespaceStructure ns={childNs} path={ns.name} />}
          </For>
        </SourceDirectory>
      )}
    </>
  );
}

interface OperationPartProps {
  op: Operation;
}
export function OperationPart({ op }: OperationPartProps) {
  const { $ } = useTsp();
  const typeName = op.name.charAt(0).toUpperCase() + op.name.substring(1);
  const requestName = `${typeName}Request`;
  const refKeyPrefix = op.namespace
    ? `${getNamespaceFullName(op.namespace)}.${op.name}`
    : op.name;
  return (
    <StatementList>
      <VarDeclaration name={`${op.name}_meta`} const export>
        <OperationObjectExpression op={op} />
      </VarDeclaration>
      <TypeDeclaration
        name={`${typeName}Request`}
        refkey={refkey(`${refKeyPrefix}.RequestParams`)}
      >
        <TsSchema type={createRequestModel($, op)} />
      </TypeDeclaration>
      <FunctionDeclaration
        name={op.name}
        parameters={[
          {
            name: 'params',
            type: requestName,
            refkey: refkey(`${refKeyPrefix}.RequestParams`),
          },
        ]}
        returnType={
          <TsSchema type={createResponseMember($, $.httpOperation.get(op))} />
        }
        export
      >
        {code`kyHelper(params, ${op.name}_meta);`}
      </FunctionDeclaration>
    </StatementList>
  );
}
