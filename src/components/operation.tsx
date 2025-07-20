import { List, StatementList } from '@alloy-js/core';
import {
  InterfaceExpression,
  InterfaceMember,
  ObjectExpression,
  ObjectProperty,
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
export function OperationObjectExpression({ op }: Props) {
  const { $ } = useTsp();
  const operationId = getOperationId($.program, op) ?? op.name;
  const httpOperation = $.httpOperation.get(op);
  const method = httpOperation.verb.toUpperCase() as HttpMethod;
  const path = httpOperation.path;

  return (
    <ObjectExpression>
      <List comma hardline enderPunctuation>
        <ObjectProperty name="operationId" value={`'${operationId}'`} />
        <ObjectProperty name="method" value={`'${method}'`} />
        <ObjectProperty name="path" value={`'${path}'`} />
      </List>
    </ObjectExpression>
  );
}

export function OperationTypeExpression({ op }: Props) {
  const { $ } = useTsp();
  const httpOperation = $.httpOperation.get(op);

  return (
    <InterfaceExpression>
      <StatementList>
        {createRequestMember(httpOperation)}
        <InterfaceMember
          name="response"
          type={<TsSchema type={createResponseMember($, httpOperation)} />}
        />
      </StatementList>
    </InterfaceExpression>
  );
}
