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
