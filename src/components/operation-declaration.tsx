import { List, StatementList } from '@alloy-js/core';
import {
  InterfaceDeclaration,
  InterfaceMember,
  ObjectExpression,
  ObjectProperty,
  VarDeclaration,
} from '@alloy-js/typescript';
import { type Operation } from '@typespec/compiler';
import { useTsp } from '@typespec/emitter-framework';
import { getOperationId } from '@typespec/openapi';
import { createRequestMember } from '../parts/request.jsx';
import { createResponseMember } from '../parts/response.jsx';
import { TsSchema } from './ts-schema.jsx';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'HEAD';

interface Props {
  op: Operation;
}
export function OperationDeclaration({ op }: Props) {
  const { $ } = useTsp();
  const operationId = getOperationId($.program, op) ?? op.name;
  const typeName =
    operationId.charAt(0).toUpperCase() + operationId.substring(1);
  const httpOperation = $.httpOperation.get(op);
  const method = httpOperation.verb.toUpperCase() as HttpMethod;
  const path = httpOperation.path;

  return (
    <StatementList>
      <VarDeclaration name={operationId} const>
        <ObjectExpression>
          <List comma hardline enderPunctuation>
            <ObjectProperty name="method" value={`'${method}'`} />
            <ObjectProperty name="path" value={`'${path}'`} />
          </List>
        </ObjectExpression>
        {' as const'}
      </VarDeclaration>
      <InterfaceDeclaration name={typeName}>
        <StatementList>
          {createRequestMember(httpOperation)}
          <InterfaceMember
            name="response"
            type={<TsSchema type={createResponseMember($, httpOperation)} />}
          />
        </StatementList>
      </InterfaceDeclaration>
    </StatementList>
  );
}
