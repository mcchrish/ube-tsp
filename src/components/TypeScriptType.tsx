import { Children } from '@alloy-js/core';
import { Type } from '@typespec/compiler';

export interface TypeScriptTypeProps {
  readonly type: Type;
}

/**
 * Maps TypeSpec types to TypeScript type expressions
 */
export function TypeScriptType(props: TypeScriptTypeProps): Children {
  const { type } = props;

  switch (type.kind) {
    case 'Scalar':
      return mapScalarType(type);
    case 'Model':
      return mapModelType(type);
    case 'Union':
      return mapUnionType(type);
    case 'Intrinsic':
      // Handle TypeSpec intrinsic types like void
      return type.name || 'any';
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

function mapModelType(type: any): Children {
  // Handle Array model specially
  if (type.name === 'Array' && type.indexer) {
    const elementTypeString = mapTypeFromValue(type.indexer.value);
    return `${elementTypeString}[]`;
  }

  // For all other models, flatten to inline object type
  if (type.properties) {
    const properties = [];
    for (const [name, prop] of type.properties) {
      const propType = mapTypeFromValue(prop.type);
      const optional = prop.optional ? '?' : '';
      properties.push(`  ${name}${optional}: ${propType};`);
    }
    return `{\n${properties.join('\n')}\n}`;
  }

  // Fallback for models without properties
  return type.name || 'Record<string, unknown>';
}

function mapUnionType(type: any): Children {
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
          return mapTypeFromValue(variant.type);
      }
    }

    // Fallback if variant.type is missing
    return 'any';
  });

  return mappedVariants.join(' | ');
}

function mapTypeFromValue(type: any): string {
  switch (type.kind) {
    case 'Scalar':
      return mapScalarType(type) as string;
    case 'Model':
      return mapModelType(type) as string;
    case 'Union':
      return mapUnionType(type) as string;
    case 'Intrinsic':
      return type.name || 'any';
    default:
      return 'any';
  }
}
