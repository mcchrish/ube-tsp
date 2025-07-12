import * as ay from '@alloy-js/core';
import { Refkey } from '@alloy-js/core';
import * as ts from '@alloy-js/typescript';
import { Type, Model, Union, Enum } from '@typespec/compiler';
import { mapTypeSpecToTypeScript } from '../lib.js';

export interface InterfaceDeclarationProps
  extends Omit<ts.InterfaceDeclarationProps, 'name'> {
  readonly type: Type;
  readonly refkey?: Refkey;
}

/**
 * Generates TypeScript interface declarations
 */
export function InterfaceDeclaration(props: InterfaceDeclarationProps) {
  const { type, refkey, ...interfaceProps } = props;

  const name = getTypeName(type);

  switch (type.kind) {
    case 'Model':
      return (
        <ModelInterface
          model={type}
          name={name}
          refkey={refkey}
          {...interfaceProps}
        />
      );
    case 'Union':
      return (
        <UnionType
          union={type}
          name={name}
          refkey={refkey}
          {...interfaceProps}
        />
      );
    case 'Enum':
      return (
        <EnumDeclaration
          enumType={type}
          name={name}
          refkey={refkey}
          {...interfaceProps}
        />
      );
    default:
      return <ts.VarDeclaration name={name} type="unknown" kind="type" />;
  }
}

function ModelInterface(
  props: {
    model: Model;
    name: string;
    refkey?: Refkey;
  } & ts.InterfaceDeclarationProps,
) {
  const { model, name, refkey, ...interfaceProps } = props;

  return (
    <ts.InterfaceDeclaration name={name} refkey={refkey} {...interfaceProps}>
      <ay.StatementList>
        <ay.For each={Array.from(model.properties.values())}>
          {(property) => (
            <ts.InterfaceMember
              name={property.name}
              optional={property.optional}
              type={mapTypeSpecToTypeScript(property.type)}
            />
          )}
        </ay.For>
      </ay.StatementList>
    </ts.InterfaceDeclaration>
  );
}

function UnionType(props: {
  union: Union;
  name: string;
  refkey?: Refkey;
  export?: boolean;
}) {
  const { name, refkey, export: shouldExport } = props;

  return (
    <ts.TypeDeclaration
      name={name}
      kind="type"
      export={shouldExport}
      refkey={refkey}
    >
      any
    </ts.TypeDeclaration>
  );
}

function EnumDeclaration(
  props: {
    enumType: Enum;
    name: string;
    refkey?: Refkey;
  } & ts.EnumDeclarationProps,
) {
  const { enumType, name, refkey, ...enumProps } = props;

  return (
    <ts.EnumDeclaration name={name} refkey={refkey} {...enumProps}>
      <ay.StatementList>
        <ay.For each={Array.from(enumType.members.values())}>
          {(member) => (
            <ts.EnumMember name={member.name} jsValue={member.value} />
          )}
        </ay.For>
      </ay.StatementList>
    </ts.EnumDeclaration>
  );
}

function getTypeName(type: Type): string {
  switch (type.kind) {
    case 'Model':
      return type.name || 'UnnamedModel';
    case 'Union':
      return type.name || 'UnnamedUnion';
    case 'Enum':
      return type.name || 'UnnamedEnum';
    case 'Scalar':
      return type.name || 'UnnamedScalar';
    default:
      return 'UnknownType';
  }
}
