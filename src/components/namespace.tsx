import {
  code,
  For,
  refkey,
  SourceDirectory,
  StatementList,
} from '@alloy-js/core';
import { SourceFile, TypeDeclaration } from '@alloy-js/typescript';
import { getNamespaceFullName, type Namespace } from '@typespec/compiler';
import { TsSchema } from './ts-schema.jsx';
import { OperationPart } from './operation.jsx';
import { useTsp } from '@typespec/emitter-framework';

interface Props {
  name: string;
  ns: Namespace;
}
export function NamespaceContent({ name, ns }: Props) {
  const { $ } = useTsp();
  const namespaces = [...ns.namespaces.values()].filter((ns) =>
    $.type.isUserDefined(ns),
  );

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

      {namespaces.length > 0 && (
        <>
          {'\n\n'}
          <StatementList>
            <For each={namespaces}>
              {(ns) =>
                code`export * as ${ns.name} from "./${name}/${ns.name}.js"`
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

  return (
    <>
      <SourceFile path={`${name}.ts`}>
        <NamespaceContent name={name} ns={ns} />
      </SourceFile>
      {namespaces.length > 0 && (
        <SourceDirectory path={name}>
          <For each={namespaces}>
            {(ns) => <NamespaceStructure name={ns.name} ns={ns} path={name} />}
          </For>
        </SourceDirectory>
      )}
    </>
  );
}
