import { type HttpOperation } from "@typespec/http";
import { type Model, type ModelProperty, type Operation } from "@typespec/compiler";
import type { Typekit } from "@typespec/compiler/typekit";

export function createRequestModel($: Typekit, op: Operation): Model {
  const httpOperation = $.httpOperation.get(op);
  const typeName = op.name.charAt(0).toUpperCase() + op.name.substring(1);
  const hasParams = httpOperation.parameters.parameters.length > 0;
  return $.model.create({
    name: typeName,
    properties: {
      params: $.modelProperty.create({
        name: "params",
        optional: !hasParams,
        type: hasParams
          ? $.model.create({
              properties: {
                ...createParameterProp($, httpOperation, "path"),
                ...createParameterProp($, httpOperation, "query"),
                ...createParameterProp($, httpOperation, "header"),
                ...createParameterProp($, httpOperation, "cookie"),
              },
            })
          : $.intrinsic.never,
      }),
      body: $.modelProperty.create({
        name: "body",
        optional: !httpOperation.parameters.body,
        type: httpOperation.parameters.body ? httpOperation.parameters.body.type : $.intrinsic.never,
      }),
    },
  });
}

export function createParameterProp(
  $: Typekit,
  httpOperation: HttpOperation,
  type: "query" | "path" | "header" | "cookie",
) {
  const params = httpOperation.parameters.parameters.filter((param) => param.type === type);
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
