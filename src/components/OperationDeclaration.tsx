import * as ts from '@alloy-js/typescript';
import * as ay from '@alloy-js/core';
import { Operation, Program } from '@typespec/compiler';
import {
  extractOperationInfo,
  groupParametersByLocation,
  hasParametersOfLocation,
} from '../utils.js';

// Import the ParameterInfo type from openapi-utils
import type { ParameterInfo, ResponseInfo } from '../utils.js';
import { mapTypeSpecToTypeScript } from '../lib.js';

interface OperationInfo {
  operationId?: string;
  name: string;
  method: string;
  path: string;
  parameters: ParameterInfo[];
  responses: ResponseInfo[];
}

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
  const interfaceName =
    operationName.charAt(0).toUpperCase() + operationName.slice(1) + 'Types';

  // Generate consolidated Types interface using proper Alloy components
  const interfaceMembers = [
    createParameterMember(
      'pathParams',
      groupedParams.path,
      hasParametersOfLocation(operationInfo.parameters, 'path'),
    ),
    createParameterMember(
      'queryParams',
      groupedParams.query,
      hasParametersOfLocation(operationInfo.parameters, 'query'),
    ),
    createParameterMember(
      'headers',
      groupedParams.header,
      hasParametersOfLocation(operationInfo.parameters, 'header'),
    ),
    createParameterMember(
      'body',
      groupedParams.body,
      hasParametersOfLocation(operationInfo.parameters, 'body'),
    ),
    createResponseMember(operationInfo.responses),
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
function createParameterMember(
  name: string,
  params: ParameterInfo[],
  hasParams: boolean,
) {
  if (hasParams && params.length > 0) {
    const parameterType = createParameterObjectType(params);
    return (
      <ts.InterfaceMember name={name} type={parameterType} optional={false} />
    );
  } else {
    return <ts.InterfaceMember name={name} type="never" optional={true} />;
  }
}

/**
 * Creates a response member using proper Alloy patterns with support for multiple status codes
 */
function createResponseMember(responses: ResponseInfo[]) {
  let responseType: ay.Children;

  if (responses.length === 0) {
    responseType = <ts.InterfaceMember name="200" type="void" />;
  } else {
    responseType = responses.map((response) => (
      <ts.InterfaceMember
        name={response.statusCode.toString()}
        type={mapTypeSpecToTypeScript(response.type)}
      />
    ));
  }

  return (
    <ts.InterfaceMember name="responses" type={responseType} optional={false} />
  );
}

/**
 * Creates a parameter object type string from parameter array
 */
function createParameterObjectType(params: ParameterInfo[]): string {
  const properties = params.map((param) => {
    const optional = param.optional ? '?' : '';
    return `${param.name}${optional}: ${mapTypeSpecToTypeScript(param.type)}`;
  });
  return `{ ${properties.join('; ')} }`;
}

/**
 * Creates the runtime config object using structured Alloy components with multi-status code support
 */
function createConfigObject(operationInfo: OperationInfo): string {
  // Extract status codes from responses
  const statusCodes =
    operationInfo.responses.length > 0
      ? operationInfo.responses.map((response) => response.statusCode)
      : [200];

  // Remove duplicates and sort
  const uniqueStatusCodes = [...new Set(statusCodes)].sort((a, b) => a - b);

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
  statusCodes: [${uniqueStatusCodes.join(', ')}]
} as const`;
}
