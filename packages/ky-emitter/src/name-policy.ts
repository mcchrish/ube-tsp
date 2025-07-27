import { createNamePolicy, type NamePolicy } from "@alloy-js/core";
import { type TypeScriptElements } from "@alloy-js/typescript";

// Reserved words
const GLOBAL_RESERVED_WORDS = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "null",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "as",
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "yield",
  "await",
]);

const CONTEXT_SAFE_WORDS = new Set(["delete", "default", "super", "this", "typeof", "instanceof"]);

/**
 * Ensures a valid TypeScript identifier for the given element kind.
 * @param name - The name to validate.
 * @param element - The TypeScript element kind.
 * @returns A TypeScript-safe name.
 */
function ensureNonReservedName(name: string, element: TypeScriptElements): string {
  const suffix = "_";

  // Global reserved words always need handling
  if (GLOBAL_RESERVED_WORDS.has(name)) {
    return `${name}${suffix}`;
  }

  // Context-safe reserved words for properties
  if (CONTEXT_SAFE_WORDS.has(name) && (element.includes("member") || element.includes("object-member"))) {
    return name; // Safe as properties
  }

  return name;
}

export function createTSNamePolicy(): NamePolicy<TypeScriptElements> {
  return createNamePolicy((name, element) => ensureNonReservedName(name, element));
}
