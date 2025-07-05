import { ModelProperty } from "@typespec/compiler";
import * as ay from "@alloy-js/core";

interface PropertyDeclarationProps {
  prop: ModelProperty;
}

export function PropertyDeclaration({ prop }: PropertyDeclarationProps) {
  return `${prop.name}${prop.optional ? "?" : ""}: any;`;
}
