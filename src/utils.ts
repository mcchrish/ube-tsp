import { type Program, type Type } from '@typespec/compiler';
import { $ } from '@typespec/compiler/typekit';

/**
 * Returns true if the given type is a declaration or an instantiation of a
 * declaration.
 */
export function isDeclaration(program: Program, type: Type): boolean {
  switch (type.kind) {
    case 'Namespace':
    case 'Interface':
    case 'Operation':
    case 'EnumMember':
      // TODO: this should reference the enum member via
      // target.enum.Name
      return false;
    case 'UnionVariant':
      return false;

    case 'Model':
      if (
        ($(program).array.is(type) || $(program).record.is(type)) &&
        isBuiltIn(program, type)
      ) {
        return false;
      }

      return Boolean(type.name);
    case 'Union':
      return Boolean(type.name);
    case 'Enum':
      return true;
    case 'Scalar':
      return true;
    default:
      return false;
  }
}

export function isBuiltIn(program: Program, type: Type) {
  if (type.kind === 'ModelProperty' && type.model) {
    type = type.model;
  }

  if (!('namespace' in type) || type.namespace === undefined) {
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

  return tln === globalNs.namespaces.get('TypeSpec');
}

// typekit doesn't consider things which have properties as records
// even though they are?
export function isRecord(program: Program, type: Type): boolean {
  return (
    type.kind === 'Model' &&
    !!type.indexer &&
    type.indexer.key === $(program).builtin.string
  );
}
