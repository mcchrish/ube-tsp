import { Children, Refkey } from '@alloy-js/core';
import * as ts from '@alloy-js/typescript';
import { Type } from '@typespec/compiler';

export interface TypeScriptTypeProps {
  readonly type: Type;
  readonly typeRefkeys?: Map<string, Refkey>;
}

/**
 * Maps TypeSpec types to TypeScript type expressions
 */
export function TypeScriptType(props: TypeScriptTypeProps): Children {
  const { type, typeRefkeys } = props;

  switch (type.kind) {
    case 'Scalar':
      return mapScalarType(type);
    case 'Model':
      return mapModelType(type, typeRefkeys);
    case 'Union':
      return mapUnionType(type, typeRefkeys);
    default:
      return 'any';
  }
}

function mapScalarType(type: any): Children {
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

function mapModelType(type: any, typeRefkeys?: Map<string, Refkey>): Children {
  // Handle Array model specially
  if (type.name === 'Array' && type.indexer) {
    const elementType = mapTypeFromValue(type.indexer.value, typeRefkeys);
    return `${elementType}[]`;
  }

  // Check if we have a refkey for this model type
  if (type.name && typeRefkeys?.has(type.name)) {
    const refkey = typeRefkeys.get(type.name)!;
    return <ts.Reference refkey={refkey} />;
  }

  // Regular model reference
  return type.name || 'Record<string, unknown>';
}

function mapUnionType(type: any, typeRefkeys?: Map<string, Refkey>): Children {
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
          return mapTypeFromValue(variant.type, typeRefkeys);
      }
    }

    // Fallback if variant.type is missing
    return 'any';
  });

  return mappedVariants.join(' | ');
}

function mapTypeFromValue(
  type: any,
  typeRefkeys?: Map<string, Refkey>,
): string {
  switch (type.kind) {
    case 'Scalar':
      return mapScalarType(type) as string;
    case 'Model':
      return mapModelType(type, typeRefkeys) as string;
    case 'Union':
      return mapUnionType(type, typeRefkeys) as string;
    default:
      return 'any';
  }
}
