import * as ts from "@alloy-js/typescript";
import { Operation, Program } from "@typespec/compiler";
import { extractOperationInfo, groupParametersByLocation, hasParametersOfLocation } from "../openapi-utils.js";
import { TypeScriptType } from "./TypeScriptType.jsx";

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
  
  // Operation metadata constants
  elements.push(
    <ts.VarDeclaration
      name="operationId"
      initializer={`'${operationInfo.operationId || operationInfo.name}' as const`}
      const
      export
    />
  );
  
  elements.push("\n");
  
  elements.push(
    <ts.VarDeclaration
      name="method"
      initializer={`'${operationInfo.method}' as const`}
      const
      export
    />
  );
  
  elements.push("\n");
  
  elements.push(
    <ts.VarDeclaration
      name="path"
      initializer={`'${operationInfo.path}' as const`}
      const
      export
    />
  );
  
  elements.push("\n");

  // Path parameters interface
  if (hasParametersOfLocation(operationInfo.parameters, "path")) {
    elements.push(
      <ts.InterfaceDeclaration
        name="PathParams"
        export
      >
        {groupedParams.path.map(param => (
          <ts.InterfaceMember
            name={param.name}
            type={<TypeScriptType type={param.type} />}
            optional={param.optional}
          />
        ))}
      </ts.InterfaceDeclaration>
    );
  }

  // Query parameters interface
  if (hasParametersOfLocation(operationInfo.parameters, "query")) {
    elements.push(
      <ts.InterfaceDeclaration
        name="QueryParams"
        export
      >
        {groupedParams.query.map(param => (
          <ts.InterfaceMember
            name={param.name}
            type={<TypeScriptType type={param.type} />}
            optional={param.optional}
          />
        ))}
      </ts.InterfaceDeclaration>
    );
  }

  // Header parameters interface
  if (hasParametersOfLocation(operationInfo.parameters, "header")) {
    elements.push(
      <ts.InterfaceDeclaration
        name="HeaderParams"
        export
      >
        {groupedParams.header.map(param => (
          <ts.InterfaceMember
            name={param.name}
            type={<TypeScriptType type={param.type} />}
            optional={param.optional}
          />
        ))}
      </ts.InterfaceDeclaration>
    );
  }

  // Request body interface
  if (hasParametersOfLocation(operationInfo.parameters, "body")) {
    elements.push(
      <ts.InterfaceDeclaration
        name="RequestBody"
        export
      >
        {groupedParams.body.map(param => (
          <ts.InterfaceMember
            name={param.name}
            type={<TypeScriptType type={param.type} />}
            optional={param.optional}
          />
        ))}
      </ts.InterfaceDeclaration>
    );
  }

  // Response types by status code
  operationInfo.responses.forEach(response => {
    elements.push(
      <ts.TypeDeclaration
        name={`Response${response.statusCode}`}
        export
      >
        <TypeScriptType type={response.type} />
      </ts.TypeDeclaration>
    );
  });

  // Comprehensive operation configuration
  elements.push(
    <ts.VarDeclaration
      name="operation"
      initializer={`{
  operationId: '${operationInfo.operationId || operationInfo.name}',
  method: '${operationInfo.method}',
  path: '${operationInfo.path}',
  ${operationInfo.summary ? `summary: '${operationInfo.summary}',` : ''}
  ${operationInfo.description ? `description: '${operationInfo.description}',` : ''}
  ${operationInfo.tags?.length ? `tags: [${operationInfo.tags.map(t => `'${t}'`).join(', ')}],` : ''}
  parameters: {
    ${hasParametersOfLocation(operationInfo.parameters, "path") ? 'path: true,' : ''}
    ${hasParametersOfLocation(operationInfo.parameters, "query") ? 'query: true,' : ''}
    ${hasParametersOfLocation(operationInfo.parameters, "header") ? 'header: true,' : ''}
    ${hasParametersOfLocation(operationInfo.parameters, "body") ? 'body: true,' : ''}
  },
  responses: [${operationInfo.responses.map(r => r.statusCode).join(', ')}],
  ${operationInfo.externalDocs ? `externalDocs: { url: '${operationInfo.externalDocs.url}', description: '${operationInfo.externalDocs.description || ''}' },` : ''}
} as const`}
      const
      export
    />
  );
  
  return elements;
}