import { List, refkey, StatementList } from '@alloy-js/core';
import {
  ObjectExpression,
  ObjectProperty,
  VarDeclaration,
} from '@alloy-js/typescript';
import { getNamespaceFullName, type Operation } from '@typespec/compiler';
import { useTsp } from '@typespec/emitter-framework';
import { TypeDeclaration } from '@typespec/emitter-framework/typescript';
import { getOperationId } from '@typespec/openapi';
import { createRequestModel } from '../parts/request.js';
import { TsSchema } from './ts-schema.jsx';
import { createResponseModel } from '../parts/response.js';

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

  const statusCodes = $.tuple.create([
    ...new Set(
      httpOperation.responses.map((res) => {
        if (typeof res.statusCodes === 'object') {
          return $.literal.create(
            res.statusCodes.end.toString().charAt(0) + 'XX',
          );
        }
        if (res.statusCodes === '*') {
          return $.literal.create('default');
        }
        return $.literal.create(res.statusCodes);
      }),
    ),
  ]);

  return (
    <ObjectExpression>
      <List comma hardline enderPunctuation>
        <ObjectProperty
          name="operationId"
          value={<TsSchema type={$.literal.create(operationId)} />}
        />
        <ObjectProperty
          name="method"
          value={<TsSchema type={$.literal.create(method)} />}
        />
        <ObjectProperty
          name="path"
          value={<TsSchema type={$.literal.create(path)} />}
        />
        <ObjectProperty
          name="statusCodes"
          value={<TsSchema type={statusCodes} />}
        />
      </List>
    </ObjectExpression>
  );
}

interface OperationPartProps {
  op: Operation;
}
export function OperationPart({ op }: OperationPartProps) {
  const { $ } = useTsp();
  const typeName = getOpTypeName(op);
  const requestName = `${typeName}Request`;
  const responseName = `${typeName}Response`;
  const refKeyPrefix = getOpNamespacePath(op);
  return (
    <>
      <List hardline>
        <StatementList>
          <VarDeclaration
            name={op.name}
            refkey={refkey(`${refKeyPrefix}.Meta`)}
            const
            export
          >
            <OperationObjectExpression op={op} />
          </VarDeclaration>
        </StatementList>
        <TypeDeclaration
          name={requestName}
          refkey={refkey(`${refKeyPrefix}.Request`)}
          export
        >
          <TsSchema type={createRequestModel($, op)} />
        </TypeDeclaration>
        <TypeDeclaration
          name={responseName}
          refkey={refkey(`${refKeyPrefix}.Response`)}
          export
        >
          <TsSchema type={createResponseModel($, $.httpOperation.get(op))} />
        </TypeDeclaration>
      </List>
    </>
  );
}

export function getOpTypeName(op: Operation) {
  return op.name.charAt(0).toUpperCase() + op.name.substring(1);
}

export function getOpNamespacePath(op: Operation) {
  const interfaceName = op.interface
    ? `${op.interface.name}.${op.name}`
    : op.name;
  return op.namespace
    ? `${getNamespaceFullName(op.namespace)}.${interfaceName}`
    : interfaceName;
}
