import { type Typekit } from '@typespec/compiler/typekit';
import { type HttpOperation } from '@typespec/http';
import { type ModelProperty, type Type, type Union } from '@typespec/compiler';

type Response = {
  statusCode: string | number;
  contentType?: string;
  headers: [string, ModelProperty][];
  body?: Type;
};

export function createResponseModel(
  $: Typekit,
  httpOperation: HttpOperation,
): Union {
  const responses = $.httpOperation
    .flattenResponses(httpOperation)
    .flatMap<Response>((res) => {
      const headers = Object.entries(res.responseContent.headers ?? {});
      const body = res.responseContent.body?.type;
      const contentType = res.contentType;
      if (typeof res.statusCode === 'object') {
        // If range is 400 to 499 then iterate 1
        // If range is 400 to 599 then iterate 2
        const iterCount = (res.statusCode.end + 1 - res.statusCode.start) / 100;
        const startCode = res.statusCode.start / 100;
        const responses: Response[] = [];
        for (let index = 0; index < iterCount; index++) {
          responses.push({
            statusCode: `${startCode + index}XX`,
            contentType,
            headers,
            body,
          });
        }
        return responses;
      } else if (typeof res.statusCode === 'number') {
        return {
          statusCode: res.statusCode,
          contentType,
          headers,
          body,
        };
      } else {
        return {
          statusCode: 'default',
          contentType,
          headers,
          body,
        };
      }
    })
    .map((res) =>
      $.model.create({
        properties: {
          statusCode: $.modelProperty.create({
            name: 'statusCode',
            type: $.literal.create(res.statusCode),
          }),
          contentTypes: $.modelProperty.create({
            name: 'contentType',
            optional: !res.contentType,
            type: res.contentType
              ? $.literal.create(res.contentType)
              : $.intrinsic.never,
          }),
          headers: $.modelProperty.create({
            name: 'headers',
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
            name: 'content',
            optional: !res.body,
            type: res.body ? res.body : $.intrinsic.never,
          }),
        },
      }),
    );
  return $.union.create(responses);
}
