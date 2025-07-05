import { EmitContext, Model, Program, Type, navigateProgram, ListenerFlow, Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";

export function getModels(context: EmitContext): readonly Model[] {
  const models: Model[] = [];

  function collectType(type: Type) {
    if (shouldReference(context.program, type)) {
      if (type.kind === "Model") {
        models.push(type);
      }
    }
  }

  const globalNs = context.program.getGlobalNamespaceType();

  navigateProgram(
    context.program,
    {
      namespace(n) {
        if (n !== globalNs && !$(context.program).type.isUserDefined(n)) {
          return ListenerFlow.NoRecursion;
        }
      },
      model: collectType,
      enum: collectType,
      union: collectType,
      scalar: collectType,
    },
    { includeTemplateDeclaration: false },
  );

  return models;
}

export function getOperations(context: EmitContext): readonly Operation[] {
  const operations: Operation[] = [];

  function collectOperation(operation: Operation) {
    operations.push(operation);
  }

  const globalNs = context.program.getGlobalNamespaceType();

  navigateProgram(
    context.program,
    {
      namespace(n) {
        if (n !== globalNs && !$(context.program).type.isUserDefined(n)) {
          return ListenerFlow.NoRecursion;
        }
      },
      operation: collectOperation,
    },
    { includeTemplateDeclaration: false },
  );

  return operations;
}

export function shouldReference(
  program: Program,
  type: Type,
) {
  return (
    isDeclaration(program, type) &&
    !isBuiltIn(program, type)
  );
}

export function isDeclaration(program: Program, type: Type): boolean {
  switch (type.kind) {
    case "Namespace":
    case "Interface":
    case "Operation":
    case "EnumMember":
      return false;
    case "UnionVariant":
      return false;

    case "Model":
      if (
        ($(program).array.is(type) || $(program).record.is(type)) &&
        isBuiltIn(program, type)
      ) {
        return false;
      }

      return Boolean(type.name);
    case "Union":
      return Boolean(type.name);
    case "Enum":
      return true;
    case "Scalar":
      return true;
    default:
      return false;
  }
}

export function isBuiltIn(program: Program, type: Type) {
  if (type.kind === "ModelProperty" && type.model) {
    type = type.model;
  }

  if (!("namespace" in type) || type.namespace === undefined) {
    return false;
  }

  const globalNs = program.getGlobalNamespaceType();
  let tln = type.namespace;
  if (tln === globalNs) {
    return false;
  }

  while (tln.namespace !== globalNs) {
    tln = tln.namespace!;
  }

  return tln === globalNs.namespaces.get("TypeSpec");
}

export function mapTypeSpecToTypeScript(type: Type): string {
  switch (type.kind) {
    case "Model":
      return type.name;
    case "Scalar":
      switch (type.name) {
        case "string":
          return "string";
        case "int32":
        case "int64":
        case "float32":
        case "float64":
          return "number";
        case "boolean":
          return "boolean";
        default:
          return "any";
      }
    default:
      return "any";
  }
}