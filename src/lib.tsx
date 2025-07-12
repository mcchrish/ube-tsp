import { Children } from '@alloy-js/core';
import * as ts from '@alloy-js/typescript';
import * as ay from '@alloy-js/core';
import {
  Type,
  EmitContext,
  Model,
  Operation,
  navigateProgram,
  createTypeSpecLibrary,
  LiteralType,
} from '@typespec/compiler';

export const $lib = createTypeSpecLibrary({
  name: 'ts-sketch',
  diagnostics: {},
});

export const { reportDiagnostic, createDiagnostic } = $lib;

export function mapTypeSpecToTypeScript(type: Type): Children {
  switch (type.kind) {
    case 'Intrinsic':
      switch (type.name) {
        case 'void':
          return 'void';
        case 'null':
          return 'null';
        case 'never':
          return 'never';
        case 'unknown':
          return 'unknown';
        default:
          return 'any';
      }

    case 'Model':
      if (type.name === 'Array' && type.indexer) {
        const elementType = mapTypeSpecToTypeScript(type.indexer.value);
        return <ts.ArrayExpression children={elementType} />;
      }

      if (type.properties && type.properties.size > 0) {
        return (
          <ts.InterfaceExpression>
            <ay.StatementList>
              {[...type.properties.values()].map(property => (
                <ts.InterfaceMember
                  name={property.name}
                  optional={property.optional}
                  type={mapTypeSpecToTypeScript(property.type)}
                />
              ))}
            </ay.StatementList>
          </ts.InterfaceExpression>
        );
      }

      return 'unknown';

    case 'Scalar':
      switch (type.name) {
        case 'string':
          return 'string';
        case 'int32':
        case 'int64':
        case 'float32':
        case 'float64':
          return 'number';
        case 'boolean':
          return 'boolean';
        case 'bytes':
          return 'Uint8Array';
        default:
          return 'any';
      }

    case 'Union':
      return [...type.variants.values()]
        .map((variant) => mapTypeSpecToTypeScript(variant.type))
        .join(' | ');

    case 'Enum':
      if (type.members && type.members.size > 0) {
        const members = [...type.members.values()].map((member) => {
          if (member.value !== undefined) {
            if (typeof member.value === 'string') {
              return `"${member.value}"`;
            }
            return String(member.value);
          }
          return `"${member.name}"`;
        });
        return members.join(' | ');
      }
      return 'string';

    case 'String':
      // Handle string literal types from TypeSpec
      return `"${(type as LiteralType & { value: string }).value}"`;

    case 'Number':
      return String((type as LiteralType & { value: number }).value);

    case 'Boolean':
      return String((type as LiteralType & { value: boolean }).value);

    default:
      return 'any';
  }
}

export function getModels(context: EmitContext): Model[] {
  const models: Model[] = [];

  navigateProgram(context.program, {
    model(model) {
      if (
        model.name &&
        !model.name.startsWith('_') &&
        !isBuiltInType(model.name) &&
        model.namespace?.name !== 'TypeSpec' &&
        model.namespace?.name !== 'TypeSpec.Http'
      ) {
        models.push(model);
      }
    },
  });

  return models;
}

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

export function getOperations(context: EmitContext): Operation[] {
  const operations: Operation[] = [];

  navigateProgram(context.program, {
    operation(operation) {
      if (operation.name) {
        operations.push(operation);
      }
    },
  });

  return operations;
}
