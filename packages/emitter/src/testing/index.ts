import {
  createTestLibrary,
  findTestPackageRoot,
  type TypeSpecTestLibrary,
} from '@typespec/compiler/testing';

export const TypeScriptEmitterTestLibrary: TypeSpecTestLibrary =
  createTestLibrary({
    name: '@kamote-tsp/emitter',
    packageRoot: await findTestPackageRoot(import.meta.url),
  });
