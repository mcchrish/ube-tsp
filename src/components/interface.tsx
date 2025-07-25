import { For } from '@alloy-js/core';
import { type Interface } from '@typespec/compiler';
import { OperationPart } from './operation.jsx';

interface Props {
  inter: Interface;
}
export function InterfaceContent({ inter }: Props) {
  return (
    <For each={inter.operations} hardline>
      {(_, op) => <OperationPart op={op} />}
    </For>
  );
}
