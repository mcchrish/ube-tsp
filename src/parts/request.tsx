import { For, StatementList } from '@alloy-js/core';
import { InterfaceExpression, InterfaceMember } from '@alloy-js/typescript';
import { type HttpOperation } from '@typespec/http';
import { TsSchema } from '../components/ts-schema.jsx';

export function createRequestMember(httpOperation: HttpOperation) {
  return (
    <InterfaceMember name="request">
      <InterfaceExpression>
        <StatementList>
          <InterfaceMember
            name="parameters"
            type={
              <InterfaceExpression>
                <StatementList>
                  {createParameterMember(httpOperation, 'path')}
                  {createParameterMember(httpOperation, 'query')}
                  {createParameterMember(httpOperation, 'header')}
                  {createParameterMember(httpOperation, 'cookie')}
                </StatementList>
              </InterfaceExpression>
            }
          />
          {createBodyMember(httpOperation)}
        </StatementList>
      </InterfaceExpression>
    </InterfaceMember>
  );
}

// TODO fallback none-json body to unknown
function createBodyMember(httpOperation: HttpOperation) {
  const body = httpOperation.parameters.body;
  return (
    !!body && (
      <InterfaceMember name="body" type={<TsSchema type={body!.type} />} />
    )
  );
}

function createParameterMember(
  httpOperation: HttpOperation,
  type: 'query' | 'path' | 'header' | 'cookie',
) {
  const params = httpOperation.parameters.parameters.filter(
    (param) => param.type === type,
  );
  const hasParams = params.length > 0;
  const allOptional = params.every((param) => param.param.optional);
  return (
    hasParams && (
      <InterfaceMember
        name={type}
        optional={allOptional}
        type={
          <InterfaceExpression>
            <For each={params}>
              {(param) => (
                <InterfaceMember
                  name={param.name}
                  type={<TsSchema type={param.param.type} />}
                  optional={param.param.optional}
                />
              )}
            </For>
          </InterfaceExpression>
        }
      />
    )
  );
}
