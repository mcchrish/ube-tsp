import { code, For, StatementList } from '@alloy-js/core';
import { SourceFile, TypeDeclaration } from '@alloy-js/typescript';
import type { Namespace } from '@typespec/compiler';
import { TsSchema } from './ts-schema.jsx';

interface Props {
  ns: Namespace;
}
export function NamespaceContent({ ns }: Props) {
  return (
    <>
      <For each={ns.models}>
        {(name, model) => (
          <TypeDeclaration name={name} export>
            <TsSchema type={model} />
          </TypeDeclaration>
        )}
      </For>
      {'\n\n'}
      <StatementList>
        <For each={ns.namespaces}>
          {(_, childNs) => <ExportNamespace ns={childNs} parentNs={ns} />}
        </For>
      </StatementList>
    </>
  );
}

interface ExportNamespaceProps {
  ns: Namespace;
  parentNs: Namespace;
}
function ExportNamespace({ ns, parentNs }: ExportNamespaceProps) {
  return code`export * as ${ns.name} from "./${parentNs.name}/${ns.name}.js"`;
}

export function NamespaceFile({ ns }: Props) {
  return (
    <SourceFile path={ns.name}>
      <NamespaceContent ns={ns} />
    </SourceFile>
  );
}
