import * as ay from "@alloy-js/core";
import { ModelProperty } from "@typespec/compiler";
import { mapTypeSpecToTypeScript } from "../lib.js";

interface PropertyDeclarationProps {
  prop: ModelProperty;
}

export function PropertyDeclaration({ prop }: PropertyDeclarationProps) {
  return `  ${prop.name}${prop.optional ? "?" : ""}: ${mapTypeSpecToTypeScript(prop.type)};\n`;
}