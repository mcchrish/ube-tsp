import {
  code,
  For,
  List,
  refkey,
  SourceDirectory,
  StatementList,
} from "@alloy-js/core";
import {
  InterfaceExpression,
  InterfaceMember,
  Reference,
  SourceFile,
  TypeDeclaration,
} from "@alloy-js/typescript";
import { getNamespaceFullName, type Namespace } from "@typespec/compiler";
import { useTsp } from "@typespec/emitter-framework";
import { InterfaceContent } from "./interface.jsx";
import { OperationPart } from "./operation.jsx";
import { TsSchema } from "./ts-schema.jsx";

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
          {"\n\n"}
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
          {"\n\n"}
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
