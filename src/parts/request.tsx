import { For, StatementList } from '@alloy-js/core';
import { InterfaceExpression, InterfaceMember } from '@alloy-js/typescript';
import { type HttpOperation } from '@typespec/http';
import { TsSchema } from '../components/ts-schema.jsx';
import {
  type Model,
  type ModelProperty,
  type Operation,
} from '@typespec/compiler';
import type { Typekit } from '@typespec/compiler/typekit';

export function createRequestModel($: Typekit, op: Operation): Model {
  const httpOperation = $.httpOperation.get(op);
  const typeName = op.name.charAt(0).toUpperCase() + op.name.substring(1);
  const hasParams = httpOperation.parameters.parameters.length > 0;
  return $.model.create({
    name: typeName,
    properties: {
      params: $.modelProperty.create({
        name: 'params',
        optional: !hasParams,
        type: hasParams
          ? $.model.create({
              properties: {
                ...createParameterProp($, httpOperation, 'path'),
                ...createParameterProp($, httpOperation, 'query'),
                ...createParameterProp($, httpOperation, 'header'),
                ...createParameterProp($, httpOperation, 'cookie'),
              },
            })
          : $.intrinsic.never,
      }),
      body: $.modelProperty.create({
        name: 'body',
        optional: !httpOperation.parameters.body,
        type: httpOperation.parameters.body
          ? httpOperation.parameters.body.type
          : $.intrinsic.never,
      }),
    },
  });
}

export function createParameterProp(
  $: Typekit,
  httpOperation: HttpOperation,
  type: 'query' | 'path' | 'header' | 'cookie',
) {
  const params = httpOperation.parameters.parameters.filter(
    (param) => param.type === type,
  );
  const hasParams = params.length > 0;
  const allOptional = params.every((param) => param.param.optional);
  return {
    [type]: $.modelProperty.create({
      name: type,
      optional: allOptional || !hasParams,
      type: hasParams
        ? $.model.create({
            properties: params.reduce(
              (props, param) => {
                return {
                  ...props,
                  [param.name]: $.modelProperty.create({
                    name: param.name,
                    type: param.param.type,
                  }),
                };
              },
              {} as Record<string, ModelProperty>,
            ),
          })
        : $.intrinsic.never,
    }),
  };
}

export function createRequestMember(httpOperation: HttpOperation) {
  const hasParams = httpOperation.parameters.parameters.length > 0;
  return (
    <InterfaceExpression>
      <StatementList>
        {hasParams && (
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
        )}
        {createBodyMember(httpOperation)}
      </StatementList>
    </InterfaceExpression>
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
