import { Children } from '@alloy-js/core';
import { Type } from '@typespec/compiler';

export interface TypeScriptTypeProps {
  readonly type: Type;
}

/**
 * Maps TypeSpec types to TypeScript type expressions using proper Alloy patterns
 */
export function TypeScriptType(props: TypeScriptTypeProps): Children {
  const { type } = props;

  return mapTypeToAlloyComponent(type);
}

/**
 * Core type mapping function that returns appropriate Alloy components or strings
 */
function mapTypeToAlloyComponent(type: Type): Children {
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

function mapScalarType(type: Type & { name?: string }): Children {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapModelType(type: Type & { name?: string; indexer?: any; properties?: Map<string, any> }): Children {
  // Handle Array model specially - use string format for inline types
  if (type.name === 'Array' && type.indexer) {
    const elementTypeString = mapTypeToString(type.indexer.value);
    return `${elementTypeString}[]`;
  }

  // For all other models, create inline object type with proper formatting
  if (type.properties) {
    const properties = [];
    for (const [name, prop] of type.properties) {
      const propType = mapTypeToString(prop.type);
      const optional = prop.optional ? '?' : '';
      properties.push(`${name}${optional}: ${propType}`);
    }
    return `{ ${properties.join('; ')} }`;
  }

  // Fallback for models without properties
  return type.name || 'Record<string, unknown>';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUnionType(type: Type & { variants: Map<string | symbol, any> }): Children {
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
          return mapTypeToString(variant.type);
      }
    }

    // Fallback if variant.type is missing
    return 'any';
  });

  return mappedVariants.join(' | ');
}

/**
 * Helper function that always returns string representation of types
 * Used when we need consistent string output for inline type generation
 */
function mapTypeToString(type: Type): string {
  const result = mapTypeToAlloyComponent(type);
  return typeof result === 'string' ? result : String(result);
}

