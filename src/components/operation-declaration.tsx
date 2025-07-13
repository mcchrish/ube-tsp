import * as ay from '@alloy-js/core';
import * as ts from '@alloy-js/typescript';
import { Operation, Program } from '@typespec/compiler';
import { mapTypeSpecToTypeScript } from '../lib.jsx';
import type { ParameterInfo, ResponseInfo } from '../utils.js';
import {
  extractOperationInfo,
  groupParametersByLocation,
  hasParametersOfLocation,
} from '../utils.js';

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
    // If all parameters are optional, make the entire group optional
    const allParamsOptional = params.every((param) => param.optional);
    return (
      <ts.InterfaceMember
        name={name}
        type={parameterType}
        optional={allParamsOptional}
      />
    );
  } else {
    return <ts.InterfaceMember name={name} type="never" optional={true} />;
  }
}

/**
 * Creates a parameter object type using proper Alloy components
 */
function createParameterObjectType(params: ParameterInfo[]): ay.Children {
  return (
    <ts.InterfaceExpression>
      <ay.StatementList>
        {params.map((param) => (
          <ts.InterfaceMember
            name={param.name}
            optional={param.optional}
            type={mapTypeSpecToTypeScript(param.type)}
          />
        ))}
      </ay.StatementList>
    </ts.InterfaceExpression>
  );
}

/**
 * Creates a response member using discriminated union structure
 */
function createResponseMember(responses: ResponseInfo[]): ay.Children {
  let responseType: ay.Children;

  if (responses.length === 0) {
    // Default 200 response with void data
    responseType = (
      <ts.InterfaceExpression>
        <ay.StatementList>
          <ts.InterfaceMember name="statusCode" type="200" />
          <ts.InterfaceMember name="data" type="void" />
        </ay.StatementList>
      </ts.InterfaceExpression>
    );
  } else if (responses.length === 1) {
    // Single response - no union needed
    const response = responses[0];
    responseType = (
      <ts.InterfaceExpression>
        <ay.StatementList>
          <ts.InterfaceMember
            name="statusCode"
            type={String(response.statusCode)}
          />
          <ts.InterfaceMember
            name="data"
            type={mapTypeSpecToTypeScript(response.type)}
          />
        </ay.StatementList>
      </ts.InterfaceExpression>
    );
  } else {
    // Join with union operator - for now use string representation
    // TODO: Use proper Alloy union type component when available
    const unionString = responses
      .map(
        (response) =>
          `{ statusCode: ${response.statusCode}; data: ${mapTypeSpecToTypeScript(response.type)} }`,
      )
      .join(' | ');

    responseType = unionString;
  }

  return (
    <ts.InterfaceMember name="responses" type={responseType} optional={false} />
  );
}

/**
 * Creates the runtime config object using structured Alloy components with multi-status code support
 */
function createConfigObject(operationInfo: OperationInfo): ay.Children {
  return (
    <ts.ObjectExpression>
      <ay.List comma>
        <ts.ObjectProperty name="method" value={`'${operationInfo.method}'`} />
        <ts.ObjectProperty name="path" value={`'${operationInfo.path}'`} />
      </ay.List>
    </ts.ObjectExpression>
  );
}
