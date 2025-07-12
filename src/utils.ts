import { Type, Program } from '@typespec/compiler';
import { $ } from '@typespec/compiler/typekit';

/**
 * Check if a type should be referenced rather than inlined
 * Based on the shouldReference function from the Zod emitter
 */
export function shouldReference(program: Program, type: Type): boolean {
  const isUserDefined = $(program).type.isUserDefined(type);

  switch (type.kind) {
    case 'Model':
      // Reference named models that are user-defined and not built-in types
      return Boolean(
        type.name &&
          isUserDefined &&
          !isBuiltInType(type.name) &&
          type.namespace?.name !== 'TypeSpec' &&
          type.namespace?.name !== 'TypeSpec.Http',
      );

    case 'Union':
    case 'Enum':
      // Always reference unions and enums if they have names and are user-defined
      return Boolean(type.name && isUserDefined);

    case 'Scalar':
      // Reference custom scalars but inline built-ins
      return Boolean(type.name && isUserDefined && !isBuiltinScalar(type.name));

    default:
      return false;
  }
}

/**
 * Check if a scalar is a built-in TypeSpec scalar
 */
function isBuiltinScalar(name: string): boolean {
  const builtins = [
    'string',
    'int8',
    'int16',
    'int32',
    'int64',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'float32',
    'float64',
    'decimal',
    'decimal128',
    'boolean',
    'plainDate',
    'plainTime',
    'utcDateTime',
    'offsetDateTime',
    'duration',
    'bytes',
    'url',
    'safeint',
  ];
  return builtins.includes(name);
}

/**
 * Check if a type name is a built-in TypeSpec/HTTP type
 */
function isBuiltInType(name: string): boolean {
  const builtInTypes = [
    'ServiceOptions',
    'DiscriminatedOptions',
    'ExampleOptions',
    'OperationExample',
    'VisibilityFilter',
    'Array',
    'EnumMember',
    'Namespace',
    'Model',
    'Scalar',
    'Enum',
    'Union',
    'ModelProperty',
    'Operation',
    'Interface',
    'UnionVariant',
    'StringTemplate',
    'LocationHeader',
    'HeaderOptions',
    'OkResponse',
    'CreatedResponse',
    'AcceptedResponse',
    'NoContentResponse',
    'MovedResponse',
    'NotModifiedResponse',
    'BadRequestResponse',
    'UnauthorizedResponse',
    'ForbiddenResponse',
    'NotFoundResponse',
    'ConflictResponse',
    'HttpPartOptions',
    'Link',
    'Record',
    'CookieOptions',
    'QueryOptions',
    'PathOptions',
    'PatchOptions',
    'BasicAuth',
    'BearerAuth',
    'AuthorizationCodeFlow',
    'ImplicitFlow',
    'PasswordFlow',
    'ClientCredentialsFlow',
    'NoAuth',
    'ApplyMergePatchOptions',
  ];

  return builtInTypes.includes(name);
}
