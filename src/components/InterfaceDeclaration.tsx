import * as ay from "@alloy-js/core";
import * as ts from "@alloy-js/typescript";
import { Type, Model, Union, Enum } from "@typespec/compiler";
import { TypeScriptType } from "./TypeScriptType.jsx";

export interface InterfaceDeclarationProps
  extends Omit<ts.InterfaceDeclarationProps, "name"> {
  readonly type: Type;
}

/**
 * Generates TypeScript interface declarations
 */
export function InterfaceDeclaration(props: InterfaceDeclarationProps) {
  const { type, ...interfaceProps } = props;
  
  const name = getTypeName(type);

  switch (type.kind) {
    case "Model":
      return <ModelInterface model={type} name={name} {...interfaceProps} />;
    case "Union":
      return <UnionType union={type} name={name} {...interfaceProps} />;
    case "Enum":
      return <EnumDeclaration enumType={type} name={name} {...interfaceProps} />;
    default:
      return <ts.VarDeclaration name={name} type="unknown" kind="type" />;
  }
}

function ModelInterface(props: { model: Model; name: string } & ts.InterfaceDeclarationProps) {
  const { model, name, ...interfaceProps } = props;
  
  return (
    <ts.InterfaceDeclaration
      name={name}
      {...interfaceProps}
    >
      <ay.For each={Array.from(model.properties.values())}>
        {(property) => (
          <ts.InterfaceMember
            name={property.name}
            optional={property.optional}
            type={<TypeScriptType type={property.type} />}
          />
        )}
      </ay.For>
    </ts.InterfaceDeclaration>
  );
}

function UnionType(props: { union: Union; name: string; export?: boolean }) {
  const { union, name, export: shouldExport } = props;

  return (
    <ts.TypeDeclaration
      name={name}
      kind="type"
      export={shouldExport}
    >
      any
    </ts.TypeDeclaration>
  );
}

function EnumDeclaration(props: { enumType: Enum; name: string } & ts.EnumDeclarationProps) {
  const { enumType, name, ...enumProps } = props;

  return (
    <ts.EnumDeclaration
      name={name}
      {...enumProps}
    >
      <ay.For each={Array.from(enumType.members.values())}>
        {(member) => (
          <ts.EnumMember
            name={member.name}
            jsValue={member.value}
          />
        )}
      </ay.For>
    </ts.EnumDeclaration>
  );
}

function getTypeName(type: Type): string {
  switch (type.kind) {
    case "Model":
      return type.name || "UnnamedModel";
    case "Union":
      return type.name || "UnnamedUnion";
    case "Enum":
      return type.name || "UnnamedEnum";
    case "Scalar":
      return type.name || "UnnamedScalar";
    default:
      return "UnknownType";
  }
}