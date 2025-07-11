import { Children } from "@alloy-js/core";
import { Type } from "@typespec/compiler";

export interface TypeScriptTypeProps {
  readonly type: Type;
}

/**
 * Maps TypeSpec types to TypeScript type expressions
 */
export function TypeScriptType(props: TypeScriptTypeProps): Children {
  const { type } = props;

  switch (type.kind) {
    case "Scalar":
      return mapScalarType(type);
    case "Model":
      return mapModelType(type);
    default:
      return "any";
  }
}

function mapScalarType(type: any): Children {
  switch (type.name) {
    case "string":
      return "string";
    case "int8":
    case "int16":
    case "int32":
    case "int64":
    case "uint8":
    case "uint16":
    case "uint32":
    case "uint64":
    case "float32":
    case "float64":
    case "decimal":
    case "decimal128":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return type.name || "any";
  }
}

function mapModelType(type: any): Children {
  // Handle Array model specially
  if (type.name === "Array" && type.indexer) {
    const elementType = mapTypeFromValue(type.indexer.value);
    return `${elementType}[]`;
  }
  
  // Regular model reference
  return type.name || "Record<string, unknown>";
}

function mapTypeFromValue(type: any): string {
  switch (type.kind) {
    case "Scalar":
      return mapScalarType(type) as string;
    case "Model":
      return mapModelType(type) as string;
    default:
      return "any";
  }
}