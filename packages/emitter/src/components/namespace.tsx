import {
  code,
  For,
  refkey,
  SourceDirectory,
  StatementList,
} from '@alloy-js/core';
import {
  InterfaceExpression,
  InterfaceMember,
  Reference,
  SourceFile,
  TypeDeclaration,
} from '@alloy-js/typescript';
import {
  getNamespaceFullName,
  type Interface,
  type Namespace,
  type Operation,
} from '@typespec/compiler';
import { TsSchema } from './ts-schema.jsx';
import { OperationPart } from './operation.jsx';
import { useTsp } from '@typespec/emitter-framework';
import { InterfaceContent } from './interface.jsx';
import { List } from '@alloy-js/core/stc';
import { createRequestModel } from '../parts/request.js';
import { createResponseModel } from '../parts/response.js';

interface Props {
  name: string;
  ns: Namespace;
}
export function NamespaceContent({ name, ns }: Props) {
  const { $ } = useTsp();
  const childRef = [
    ...ns.namespaces.values(),
    ...ns.interfaces.values(),
  ].filter((ref) => $.type.isUserDefined(ref));

  const refKeyPrefix = ns.name ? getNamespaceFullName(ns) : name;

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
          <List hardline>
            <For each={ns.operations} hardline>
              {(_, op) => <OperationPart op={op} />}
            </For>

            <TypeDeclaration
              name="OperationMap"
              refkey={refkey(`${refKeyPrefix}.OperationMap`)}
              export
            >
              <InterfaceExpression>
                <For each={ns.operations} hardline semicolon enderPunctuation>
                  {(_, op) => (
                    <InterfaceMember name={op.name}>
                      <InterfaceExpression>
                        <StatementList>
                          <InterfaceMember
                            name="request"
                            type={
                              <Reference
                                refkey={refkey(
                                  `${refKeyPrefix}.${op.name}.Request`,
                                )}
                              />
                            }
                          />
                          <InterfaceMember
                            name="response"
                            type={
                              <Reference
                                refkey={refkey(
                                  `${refKeyPrefix}.${op.name}.Response`,
                                )}
                              />
                            }
                          />
                        </StatementList>
                      </InterfaceExpression>
                    </InterfaceMember>
                  )}
                </For>
              </InterfaceExpression>
            </TypeDeclaration>
          </List>
        </>
      )}

      {childRef.length > 0 && (
        <>
          {'\n\n'}
          <StatementList>
            <For each={childRef}>
              {(ref) =>
                code`export * as ${ref.name} from "./${name}/${ref.name}.js"`
              }
            </For>
          </StatementList>
        </>
      )}
    </>
  );
}

export function NamespaceStructure({
  name,
  ns,
}: {
  name: string;
  ns: Namespace;
  path?: string;
}) {
  const { $ } = useTsp();
  const namespaces = [...ns.namespaces.values()].filter((ns) =>
    $.type.isUserDefined(ns),
  );
  const inters = [...ns.interfaces.values()].filter(
    (inter) => $.type.isUserDefined(inter) && inter.operations.size > 0,
  );

  return (
    <>
      <SourceFile path={`${name}.ts`}>
        <NamespaceContent name={name} ns={ns} />
      </SourceFile>
      {(namespaces.length > 0 || inters.length > 0) && (
        <SourceDirectory path={name}>
          <For each={namespaces}>
            {(ns) => <NamespaceStructure name={ns.name} ns={ns} path={name} />}
          </For>
          <For each={inters}>
            {(inter) => (
              <SourceFile path={`${inter.name}.ts`}>
                <InterfaceContent inter={inter} />
              </SourceFile>
            )}
          </For>
        </SourceDirectory>
      )}
    </>
  );
}

export function OperationMap({ ns }: { ns: Namespace | Interface }) {
  const { $ } = useTsp();
  const childNsOrInter =
    'namespaces' in ns
      ? [...ns.namespaces.values(), ...ns.interfaces.values()].filter((ns) =>
          $.type.isUserDefined(ns),
        )
      : [];

  return ns.operations.size > 0 || childNsOrInter.length > 0 ? (
    <InterfaceExpression>
      <StatementList>
        {ns.operations.size > 0 && (
          <For each={ns.operations} semicolon hardline>
            {(_, op) => <OperationSignature op={op} />}
          </For>
        )}
        {childNsOrInter.length > 0 && (
          <For each={childNsOrInter} semicolon hardline>
            {(ns) => (
              <InterfaceMember name={ns.name} type={<OperationMap ns={ns} />} />
            )}
          </For>
        )}
      </StatementList>
    </InterfaceExpression>
  ) : (
    'never'
  );
}

function OperationSignature({ op }: { op: Operation }) {
  const { $ } = useTsp();
  const requestModel = createRequestModel($, op);
  const allOptional = [...requestModel.properties.values()].every(
    (param) => param.optional,
  );
  const responseModel = createResponseModel($, $.httpOperation.get(op));
  return (
    <InterfaceMember
      name={op.name}
      type={code`(params${allOptional ? '?' : ''}: ${(<TsSchema type={requestModel} />)}, kyOptions?: Options) => Promise<${(<TsSchema type={responseModel} />)}>`}
    />
  );
}
