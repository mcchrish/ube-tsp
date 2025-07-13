import { Children } from '@alloy-js/core';
import * as ts from '@alloy-js/typescript';
import * as ay from '@alloy-js/core';
import { Type, createTypeSpecLibrary, LiteralType } from '@typespec/compiler';

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
        return (
          <>
            {elementType}
            <ts.ArrayExpression />
          </>
        );
      }

      if (type.properties.size > 0) {
        return (
          <ts.InterfaceExpression>
            <ay.StatementList>
              {[...type.properties.values()].flatMap((property) => {
                if (property.name === 'type') {
                  return [];
                }
                return (
                  <ts.InterfaceMember
                    name={property.name}
                    optional={property.optional}
                    type={mapTypeSpecToTypeScript(property.type)}
                  />
                );
              })}
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
      // Since ts.UnionExpression doesn't exist, use string-based union generation
      return (
        <ay.List joiner=" | ">
          {[...type.variants.values()].map((variant) => {
            return mapTypeSpecToTypeScript(variant.type);
          })}
        </ay.List>
      );

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
