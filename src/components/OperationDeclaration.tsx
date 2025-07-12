import * as ts from '@alloy-js/typescript';
import * as ay from '@alloy-js/core';
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
 * Generates operation files with consolidated Types interface and runtime config
 */
export function OperationDeclaration(props: OperationDeclarationProps) {
  const { operation, program } = props;

  const operationInfo = extractOperationInfo(program, operation);
  const groupedParams = groupParametersByLocation(operationInfo.parameters);
  
  // Capitalize operation name for interface (e.g., CreatePet)
  const operationName = operationInfo.operationId || operationInfo.name;
  const interfaceName = operationName.charAt(0).toUpperCase() + operationName.slice(1) + 'Types';

  // Generate consolidated Types interface using proper Alloy components
  const interfaceMembers = [
    createParameterMember('pathParams', groupedParams.path, hasParametersOfLocation(operationInfo.parameters, 'path')),
    createParameterMember('queryParams', groupedParams.query, hasParametersOfLocation(operationInfo.parameters, 'query')),
    createParameterMember('headers', groupedParams.header, hasParametersOfLocation(operationInfo.parameters, 'header')),
    createParameterMember('body', groupedParams.body, hasParametersOfLocation(operationInfo.parameters, 'body')),
    createResponseMember(operationInfo.responses)
  ];


  return (
    <ay.StatementList>
      <ts.InterfaceDeclaration name={interfaceName} export>
        <ay.StatementList>{interfaceMembers}</ay.StatementList>
      </ts.InterfaceDeclaration>
      
      <ts.VarDeclaration
        name={operationName}
        initializer={createConfigObject(operationInfo)}
        const
        export
      />
    </ay.StatementList>
  );
}

/**
 * Creates a parameter member for the interface using proper Alloy patterns
 */
function createParameterMember(name: string, params: any[], hasParams: boolean) {
  if (hasParams && params.length > 0) {
    const parameterType = createParameterObjectType(params);
    return (
      <ts.InterfaceMember
        name={name}
        type={parameterType}
        optional={false}
      />
    );
  } else {
    return (
      <ts.InterfaceMember
        name={name}
        type="never"
        optional={true}
      />
    );
  }
}

/**
 * Creates a response member using proper Alloy patterns
 */
function createResponseMember(responses: any[]) {
  const responseType = responses.length > 0 
    ? `{ 200: ${getTypeString(responses[0].type)} }`
    : '{ 200: void }';
  
  return (
    <ts.InterfaceMember
      name="responses"
      type={responseType}
      optional={false}
    />
  );
}

/**
 * Creates a parameter object type string from parameter array
 */
function createParameterObjectType(params: any[]): string {
  const properties = params.map(param => {
    const optional = param.optional ? '?' : '';
    return `${param.name}${optional}: ${getTypeString(param.type)}`;
  });
  return `{ ${properties.join('; ')} }`;
}

/**
 * Helper function to get TypeScript type string from TypeSpec type
 * (Reusing TypeScriptType component logic as string)
 */
function getTypeString(type: any): string {
  return TypeScriptType({ type }) as string;
}

/**
 * Creates the runtime config object using structured Alloy components
 */
function createConfigObject(operationInfo: any): string {
  return `{
  operationId: '${operationInfo.operationId || operationInfo.name}',
  method: '${operationInfo.method}' as const,
  path: '${operationInfo.path}',
  parameterTypes: {
    hasPathParams: ${hasParametersOfLocation(operationInfo.parameters, 'path')},
    hasQueryParams: ${hasParametersOfLocation(operationInfo.parameters, 'query')},
    hasHeaders: ${hasParametersOfLocation(operationInfo.parameters, 'header')},
    hasBody: ${hasParametersOfLocation(operationInfo.parameters, 'body')}
  },
  statusCodes: [200]
} as const`;
}
