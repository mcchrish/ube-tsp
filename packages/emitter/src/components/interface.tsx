import { For, List, refkey, StatementList } from '@alloy-js/core';
import { getNamespaceFullName, type Interface } from '@typespec/compiler';
import { OperationPart } from './operation.jsx';
import {
  InterfaceExpression,
  InterfaceMember,
  Reference,
  TypeDeclaration,
} from '@alloy-js/typescript';

interface Props {
  inter: Interface;
}
export function InterfaceContent({ inter }: Props) {
  const refKeyPrefix = inter.namespace
    ? `${getNamespaceFullName(inter.namespace)}.${inter.name}`
    : inter.name;
  return (
    <List hardline>
      <For each={inter.operations} hardline>
        {(_, op) => <OperationPart op={op} />}
      </For>

      <TypeDeclaration
        name="OperationMap"
        refkey={refkey(`${refKeyPrefix}.OperationMap`)}
        export
      >
        <InterfaceExpression>
          <For each={inter.operations} hardline semicolon enderPunctuation>
            {(_, op) => (
              <InterfaceMember name={op.name}>
                <InterfaceExpression>
                  <StatementList>
                    <InterfaceMember
                      name="request"
                      type={
                        <Reference
                          refkey={refkey(`${refKeyPrefix}.${op.name}.Request`)}
                        />
                      }
                    />
                    <InterfaceMember
                      name="response"
                      type={
                        <Reference
                          refkey={refkey(`${refKeyPrefix}.${op.name}.Response`)}
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
  );
}
