import { For, StatementList } from '@alloy-js/core';
import { InterfaceExpression, InterfaceMember } from '@alloy-js/typescript';
import { Typekit } from '@typespec/compiler/typekit';
import { HttpOperation } from '@typespec/http';
import { FlatHttpResponse } from '@typespec/http/experimental/typekit';
import { TsSchema } from '../components/ts-schema.jsx';

type Response = {
  statusCode: string;
  res: FlatHttpResponse;
};

export function createResponseMember($: Typekit, httpOperation: HttpOperation) {
  const responses = $.httpOperation
    .flattenResponses(httpOperation)
    .flatMap((res) => {
      if (typeof res.statusCode === 'object') {
        const responses: Response[] = [];
        // If range is 400 to 499 then iterate 1
        // If range is 400 to 599 then iterate 2
        const iterCount = (res.statusCode.end + 1 - res.statusCode.start) / 100;
        const startCode = res.statusCode.start / 100;
        for (let index = 0; index < iterCount; index++) {
          responses.push({ statusCode: `${startCode + index}XX`, res });
        }
        return responses;
      }
      return { statusCode: res.statusCode.toString(), res };
    });
  return responses.length ? (
    <InterfaceMember
      name="response"
      type={
        <InterfaceExpression>
          <StatementList>
            <For each={responses}>
              {({ statusCode, res }) => {
                const headers = res.responseContent.headers
                  ? Object.entries(res.responseContent.headers)
                  : [];
                const allHeaderOptional = headers.every(
                  ([, type]) => type.optional,
                );
                return (
                  <InterfaceMember
                    name={statusCode}
                    type={
                      <InterfaceExpression>
                        <StatementList>
                          {headers.length ? (
                            <InterfaceMember
                              name="headers"
                              optional={allHeaderOptional}
                              type={
                                <InterfaceExpression>
                                  <StatementList>
                                    <For each={headers}>
                                      {([name, type]) => (
                                        <InterfaceMember
                                          name={name}
                                          type={<TsSchema type={type.type} />}
                                          optional={type.optional}
                                        />
                                      )}
                                    </For>
                                  </StatementList>
                                </InterfaceExpression>
                              }
                            />
                          ) : (
                            <InterfaceMember
                              name="headers"
                              type="never"
                              optional={true}
                            />
                          )}
                          {res.responseContent.body ? (
                            <InterfaceMember
                              name="content"
                              type={
                                <TsSchema
                                  type={res.responseContent.body.type}
                                />
                              }
                            />
                          ) : (
                            <InterfaceMember
                              name="content"
                              type="never"
                              optional={true}
                            />
                          )}
                        </StatementList>
                      </InterfaceExpression>
                    }
                  />
                );
              }}
            </For>
          </StatementList>
        </InterfaceExpression>
      }
    />
  ) : (
    <InterfaceMember name="response" type="void" />
  );
}
