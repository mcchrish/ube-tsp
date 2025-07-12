import * as ts from '@alloy-js/typescript';
import * as ay from '@alloy-js/core';
import { Refkey } from '@alloy-js/core';
import { Operation, Program } from '@typespec/compiler';
import {
  extractOperationInfo,
  groupParametersByLocation,
  hasParametersOfLocation,
} from '../openapi-utils.js';
import { TypeScriptType } from './TypeScriptType.jsx';

export interface OperationDeclarationProps {
  readonly operation: Operation;
  readonly program: Program;
}

/**
 * Generates operation files with comprehensive method details, parameters, and response types
 */
export function OperationDeclaration(props: OperationDeclarationProps) {
  const { operation, program } = props;

  const operationInfo = extractOperationInfo(program, operation);
  const groupedParams = groupParametersByLocation(operationInfo.parameters);

  const elements = [];

  // Add operation constants
  elements.push(
    <ts.VarDeclaration
      name="operationId"
      initializer={`'${operationInfo.operationId || operationInfo.name}' as const`}
      const
      export
    />,

    <ts.VarDeclaration
      name="method"
      initializer={`'${operationInfo.method}' as const`}
      const
      export
    />,

    <ts.VarDeclaration
      name="path"
      initializer={`'${operationInfo.path}' as const`}
      const
      export
    />,
  );

  // Add conditional interfaces
  if (hasParametersOfLocation(operationInfo.parameters, 'path')) {
    elements.push(
      <ts.InterfaceDeclaration name="PathParams" export>
        <ay.StatementList>
          {groupedParams.path.map((param) => (
            <ts.InterfaceMember
              name={param.name}
              type={
                <TypeScriptType type={param.type} />
              }
              optional={param.optional}
            />
          ))}
        </ay.StatementList>
      </ts.InterfaceDeclaration>,
    );
  }

  if (hasParametersOfLocation(operationInfo.parameters, 'query')) {
    elements.push(
      <ts.InterfaceDeclaration name="QueryParams" export>
        <ay.StatementList>
          {groupedParams.query.map((param) => (
            <ts.InterfaceMember
              name={param.name}
              type={
                <TypeScriptType type={param.type} />
              }
              optional={param.optional}
            />
          ))}
        </ay.StatementList>
      </ts.InterfaceDeclaration>,
    );
  }

  if (hasParametersOfLocation(operationInfo.parameters, 'header')) {
    elements.push(
      <ts.InterfaceDeclaration name="HeaderParams" export>
        <ay.StatementList>
          {groupedParams.header.map((param) => (
            <ts.InterfaceMember
              name={param.name}
              type={
                <TypeScriptType type={param.type} />
              }
              optional={param.optional}
            />
          ))}
        </ay.StatementList>
      </ts.InterfaceDeclaration>,
    );
  }

  if (hasParametersOfLocation(operationInfo.parameters, 'body')) {
    elements.push(
      <ts.InterfaceDeclaration name="RequestBody" export>
        <ay.StatementList>
          {groupedParams.body.map((param) => (
            <ts.InterfaceMember
              name={param.name}
              type={
                <TypeScriptType type={param.type} />
              }
              optional={param.optional}
            />
          ))}
        </ay.StatementList>
      </ts.InterfaceDeclaration>,
    );
  }

  // Add response types
  operationInfo.responses.forEach((response) => {
    elements.push(
      <ts.TypeDeclaration name={`Response${response.statusCode}`} export>
        <TypeScriptType type={response.type} />
      </ts.TypeDeclaration>,
    );
  });

  // Add operation configuration
  const operationParts = [
    `operationId: '${operationInfo.operationId || operationInfo.name}',`,
    `method: '${operationInfo.method}',`,
    `path: '${operationInfo.path}',`,
  ];

  if (operationInfo.summary) {
    operationParts.push(`summary: '${operationInfo.summary}',`);
  }
  if (operationInfo.description) {
    operationParts.push(`description: '${operationInfo.description}',`);
  }
  if (operationInfo.tags?.length) {
    operationParts.push(`tags: [${operationInfo.tags.map((t) => `'${t}'`).join(', ')}],`);
  }

  const parameterParts = [];
  if (hasParametersOfLocation(operationInfo.parameters, 'path')) {
    parameterParts.push('path: true,');
  }
  if (hasParametersOfLocation(operationInfo.parameters, 'query')) {
    parameterParts.push('query: true,');
  }
  if (hasParametersOfLocation(operationInfo.parameters, 'header')) {
    parameterParts.push('header: true,');
  }
  if (hasParametersOfLocation(operationInfo.parameters, 'body')) {
    parameterParts.push('body: true,');
  }

  operationParts.push(`parameters: {
    ${parameterParts.join('\n    ')}
  },`);

  operationParts.push(`responses: [${operationInfo.responses.map((r) => r.statusCode).join(', ')}],`);

  if (operationInfo.externalDocs) {
    operationParts.push(`externalDocs: { url: '${operationInfo.externalDocs.url}', description: '${operationInfo.externalDocs.description || ''}' },`);
  }

  elements.push(
    <ts.VarDeclaration
      name="operation"
      initializer={`{
  ${operationParts.join('\n  ')}
} as const`}
      const
      export
    />,
  );

  return <ay.StatementList>{elements}</ay.StatementList>;
}
