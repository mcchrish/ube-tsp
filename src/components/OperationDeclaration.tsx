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
  readonly typeRefkeys: Map<string, Refkey>;
}

/**
 * Generates operation files with comprehensive method details, parameters, and response types
 */
export function OperationDeclaration(props: OperationDeclarationProps) {
  const { operation, program, typeRefkeys } = props;

  const operationInfo = extractOperationInfo(program, operation);
  const groupedParams = groupParametersByLocation(operationInfo.parameters);

  // Collect referenced types for imports
  const referencedTypes = new Set<string>();

  // Check response types for referenced models
  operationInfo.responses.forEach((response) => {
    if (response.type.kind === 'Model' && response.type.name) {
      referencedTypes.add(response.type.name);
    }
  });

  // TODO: Add imports for referenced types like Pet
  // For now, skip import generation due to API uncertainty

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
                <TypeScriptType type={param.type} typeRefkeys={typeRefkeys} />
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
                <TypeScriptType type={param.type} typeRefkeys={typeRefkeys} />
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
                <TypeScriptType type={param.type} typeRefkeys={typeRefkeys} />
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
                <TypeScriptType type={param.type} typeRefkeys={typeRefkeys} />
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
        <TypeScriptType type={response.type} typeRefkeys={typeRefkeys} />
      </ts.TypeDeclaration>,
    );
  });

  // Add operation configuration
  elements.push(
    <ts.VarDeclaration
      name="operation"
      initializer={`{
  operationId: '${operationInfo.operationId || operationInfo.name}',
  method: '${operationInfo.method}',
  path: '${operationInfo.path}',
  ${operationInfo.summary ? `summary: '${operationInfo.summary}',` : ''}
  ${operationInfo.description ? `description: '${operationInfo.description}',` : ''}
  ${operationInfo.tags?.length ? `tags: [${operationInfo.tags.map((t) => `'${t}'`).join(', ')}],` : ''}
  parameters: {
    ${hasParametersOfLocation(operationInfo.parameters, 'path') ? 'path: true,' : ''}
    ${hasParametersOfLocation(operationInfo.parameters, 'query') ? 'query: true,' : ''}
    ${hasParametersOfLocation(operationInfo.parameters, 'header') ? 'header: true,' : ''}
    ${hasParametersOfLocation(operationInfo.parameters, 'body') ? 'body: true,' : ''}
  },
  responses: [${operationInfo.responses.map((r) => r.statusCode).join(', ')}],
  ${operationInfo.externalDocs ? `externalDocs: { url: '${operationInfo.externalDocs.url}', description: '${operationInfo.externalDocs.description || ''}' },` : ''}
} as const`}
      const
      export
    />,
  );

  return <ay.StatementList>{elements}</ay.StatementList>;
}
