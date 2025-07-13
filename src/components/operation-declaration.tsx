import { StatementList } from '@alloy-js/core';
import { ObjectExpression, VarDeclaration } from '@alloy-js/typescript';
import { Operation } from '@typespec/compiler';
import { useTsp } from '@typespec/emitter-framework';
import { getOperationId } from '@typespec/openapi';

interface Props {
  op: Operation;
}
export function OperationDeclaration({ op }: Props) {
  const { $ } = useTsp();
  const operationId = getOperationId($.program, op) ?? op.name;
  const typeName =
    operationId.charAt(0).toUpperCase() + operationId.substring(1);
  return (
    <StatementList>
      <VarDeclaration name={typeName} const>
        <ObjectExpression></ObjectExpression>
        {' as const'}
      </VarDeclaration>
    </StatementList>
  );
}
