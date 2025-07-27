import { type Typekit } from "@typespec/compiler/typekit";
import { type HttpOperation, type HttpPayloadBody } from "@typespec/http";
import { type ModelProperty, type Union } from "@typespec/compiler";

type Response = {
  statusCode: string | number;
  headers: [string, ModelProperty][];
  body?: HttpPayloadBody;
};

export function createResponseModel($: Typekit, httpOperation: HttpOperation): Union {
  const responses = getFlattenResponse($, httpOperation).map((res) =>
    $.model.create({
      properties: {
        statusCode: $.modelProperty.create({
          name: "statusCode",
          type: $.literal.create(res.statusCode),
        }),
        headers: $.modelProperty.create({
          name: "headers",
          optional: !res.headers.length,
          type: res.headers.length
            ? $.model.create({
                properties: res.headers.reduce(
                  (props, [name, { type }]) => {
                    return {
                      ...props,
                      [name]: $.modelProperty.create({
                        name,
                        type,
                      }),
                    };
                  },
                  {} as Record<string, ModelProperty>,
                ),
              })
            : $.intrinsic.never,
        }),
        content: $.modelProperty.create({
          name: "content",
          optional: !res.body,
          type: res.body ? res.body.type : $.intrinsic.never,
        }),
      },
    }),
  );
  return $.union.create(responses);
}

export function getFlattenResponse($: Typekit, httpOperation: HttpOperation) {
  return $.httpOperation.flattenResponses(httpOperation).flatMap<Response>((res) => {
    const headers = Object.entries(res.responseContent.headers ?? {});
    const body = res.responseContent.body;
    if (typeof res.statusCode === "object") {
      // If range is 400 to 499 then iterate 1
      // If range is 400 to 599 then iterate 2
      const iterCount = (res.statusCode.end + 1 - res.statusCode.start) / 100;
      const startCode = res.statusCode.start / 100;
      const responses: Response[] = [];
      for (let index = 0; index < iterCount; index++) {
        responses.push({
          statusCode: `${startCode + index}XX`,
          headers,
          ...(!!body && { body }),
        });
      }
      return responses;
    } else if (typeof res.statusCode === "number") {
      return {
        statusCode: res.statusCode,
        headers,
        ...(!!body && { body }),
      };
    } else {
      return {
        statusCode: "default",
        headers,
        ...(!!body && { body }),
      };
    }
  });
}
