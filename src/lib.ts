import { Type, EmitContext, Model, Operation, navigateProgram } from "@typespec/compiler";

export function mapTypeSpecToTypeScript(type: Type): string {
  switch (type.kind) {
    case "Model":
      if (type.name === "Array" && type.indexer) {
        return `${mapTypeSpecToTypeScript(type.indexer.value)}[]`;
      }
      return type.name || "Record<string, unknown>";
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

export function getModels(context: EmitContext): Model[] {
  const models: Model[] = [];
  
  navigateProgram(context.program, {
    model(model) {
      if (model.name && 
          !model.name.startsWith("_") && 
          !isBuiltInType(model.name) &&
          model.namespace?.name !== "TypeSpec" &&
          model.namespace?.name !== "TypeSpec.Http") {
        models.push(model);
      }
    }
  });
  
  return models;
}

function isBuiltInType(name: string): boolean {
  const builtInTypes = [
    "ServiceOptions", "DiscriminatedOptions", "ExampleOptions", "OperationExample",
    "VisibilityFilter", "Array", "EnumMember", "Namespace", "Model", "Scalar",
    "Enum", "Union", "ModelProperty", "Operation", "Interface", "UnionVariant",
    "StringTemplate", "LocationHeader", "HeaderOptions", "OkResponse", "CreatedResponse",
    "AcceptedResponse", "NoContentResponse", "MovedResponse", "NotModifiedResponse",
    "BadRequestResponse", "UnauthorizedResponse", "ForbiddenResponse", "NotFoundResponse",
    "ConflictResponse", "HttpPartOptions", "Link", "Record", "CookieOptions",
    "QueryOptions", "PathOptions", "PatchOptions", "BasicAuth", "BearerAuth",
    "AuthorizationCodeFlow", "ImplicitFlow", "PasswordFlow", "ClientCredentialsFlow",
    "NoAuth", "ApplyMergePatchOptions"
  ];
  
  return builtInTypes.includes(name);
}

export function getOperations(context: EmitContext): Operation[] {
  const operations: Operation[] = [];
  
  navigateProgram(context.program, {
    operation(operation) {
      if (operation.name) {
        operations.push(operation);
      }
    }
  });
  
  return operations;
}