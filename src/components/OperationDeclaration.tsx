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
 * Generates operation files with consolidated Types interface and runtime config
 */
export function OperationDeclaration(props: OperationDeclarationProps) {
  const { operation, program } = props;

  const operationInfo = extractOperationInfo(program, operation);
  const groupedParams = groupParametersByLocation(operationInfo.parameters);
  
  // Capitalize operation name for interface (e.g., CreatePet)
  const operationName = operationInfo.operationId || operationInfo.name;
  const interfaceName = operationName.charAt(0).toUpperCase() + operationName.slice(1) + 'Types';

  const elements = [];

  // Generate consolidated Types interface
  const interfaceMembers = [];

  // Path parameters
  if (hasParametersOfLocation(operationInfo.parameters, 'path')) {
    const pathParamsType = `{ ${groupedParams.path.map(param => 
      `${param.name}${param.optional ? '?' : ''}: ${getTypeString(param.type)}`
    ).join('; ')} }`;
    interfaceMembers.push(
      <ts.InterfaceMember
        name="pathParams"
        type={pathParamsType}
        optional={false}
      />
    );
  } else {
    interfaceMembers.push(
      <ts.InterfaceMember
        name="pathParams"
        type="never"
        optional={true}
      />
    );
  }

  // Query parameters
  if (hasParametersOfLocation(operationInfo.parameters, 'query')) {
    const queryParamsType = `{ ${groupedParams.query.map(param => 
      `${param.name}${param.optional ? '?' : ''}: ${getTypeString(param.type)}`
    ).join('; ')} }`;
    interfaceMembers.push(
      <ts.InterfaceMember
        name="queryParams"
        type={queryParamsType}
        optional={false}
      />
    );
  } else {
    interfaceMembers.push(
      <ts.InterfaceMember
        name="queryParams"
        type="never"
        optional={true}
      />
    );
  }

  // Headers
  if (hasParametersOfLocation(operationInfo.parameters, 'header')) {
    const headersType = `{ ${groupedParams.header.map(param => 
      `${param.name}${param.optional ? '?' : ''}: ${getTypeString(param.type)}`
    ).join('; ')} }`;
    interfaceMembers.push(
      <ts.InterfaceMember
        name="headers"
        type={headersType}
        optional={false}
      />
    );
  } else {
    interfaceMembers.push(
      <ts.InterfaceMember
        name="headers"
        type="never"
        optional={true}
      />
    );
  }

  // Body parameters
  if (hasParametersOfLocation(operationInfo.parameters, 'body')) {
    const bodyType = `{ ${groupedParams.body.map(param => 
      `${param.name}${param.optional ? '?' : ''}: ${getTypeString(param.type)}`
    ).join('; ')} }`;
    interfaceMembers.push(
      <ts.InterfaceMember
        name="body"
        type={bodyType}
        optional={false}
      />
    );
  } else {
    interfaceMembers.push(
      <ts.InterfaceMember
        name="body"
        type="never"
        optional={true}
      />
    );
  }

  // Responses
  const responsesType = `{ ${operationInfo.responses.map(response => 
    `200: ${getTypeString(response.type)}`
  ).join('; ')} }`;
  interfaceMembers.push(
    <ts.InterfaceMember
      name="responses"
      type={responsesType}
      optional={false}
    />
  );

  elements.push(
    <ts.InterfaceDeclaration name={interfaceName} export>
      <ay.StatementList>{interfaceMembers}</ay.StatementList>
    </ts.InterfaceDeclaration>
  );

  // Generate runtime config object
  const configParts = [
    `operationId: '${operationInfo.operationId || operationInfo.name}',`,
    `method: '${operationInfo.method}' as const,`,
    `path: '${operationInfo.path}',`,
    `parameterTypes: {`,
    `  hasPathParams: ${hasParametersOfLocation(operationInfo.parameters, 'path')},`,
    `  hasQueryParams: ${hasParametersOfLocation(operationInfo.parameters, 'query')},`,
    `  hasHeaders: ${hasParametersOfLocation(operationInfo.parameters, 'header')},`,
    `  hasBody: ${hasParametersOfLocation(operationInfo.parameters, 'body')}`,
    `},`,
    `statusCodes: [200]`
  ];

  elements.push(
    <ts.VarDeclaration
      name={operationName}
      initializer={`{
  ${configParts.join('\n  ')}
} as const`}
      const
      export
    />,
  );

  return <ay.StatementList>{elements}</ay.StatementList>;
}

/**
 * Helper function to get TypeScript type string from TypeSpec type
 */
function getTypeString(type: any): string {
  switch (type.kind) {
    case 'Scalar':
      return mapScalarType(type);
    case 'Model':
      return mapModelType(type);
    case 'Union':
      return mapUnionType(type);
    case 'Intrinsic':
      return type.name || 'any';
    default:
      return 'any';
  }
}

function mapScalarType(type: any): string {
  switch (type.name) {
    case 'string':
      return 'string';
    case 'int8':
    case 'int16':
    case 'int32':
    case 'int64':
    case 'uint8':
    case 'uint16':
    case 'uint32':
    case 'uint64':
    case 'float32':
    case 'float64':
    case 'decimal':
    case 'decimal128':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return type.name || 'any';
  }
}

function mapModelType(type: any): string {
  // Handle Array model specially
  if (type.name === 'Array' && type.indexer) {
    const elementTypeString = getTypeString(type.indexer.value);
    return `${elementTypeString}[]`;
  }

  // For all other models, flatten to inline object type
  if (type.properties) {
    const properties = [];
    for (const [name, prop] of type.properties) {
      const propType = getTypeString(prop.type);
      const optional = prop.optional ? '?' : '';
      properties.push(`${name}${optional}: ${propType}`);
    }
    return `{ ${properties.join('; ')} }`;
  }

  // Fallback for models without properties
  return type.name || 'Record<string, unknown>';
}

function mapUnionType(type: any): string {
  const variants = [...type.variants.values()];

  const mappedVariants = variants.map((variant) => {
    // Handle TypeSpec literal types (based on Zod emitter pattern)
    if (variant.type) {
      switch (variant.type.kind) {
        case 'String':
          // String literal: type.value contains the actual string value
          return `"${variant.type.value}"`;
        case 'Number':
        case 'Boolean':
          // Number/Boolean literal: type.value contains the actual value
          return `${variant.type.value}`;
        default:
          // For other types (models, scalars, etc.), use standard mapping
          return getTypeString(variant.type);
      }
    }

    // Fallback if variant.type is missing
    return 'any';
  });

  return mappedVariants.join(' | ');
}
