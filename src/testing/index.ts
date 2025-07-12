import {
  createTestLibrary,
  findTestPackageRoot,
  type TypeSpecTestLibrary,
} from '@typespec/compiler/testing';

export const TypeScriptEmitterTestLibrary: TypeSpecTestLibrary =
  createTestLibrary({
    name: 'typespec-typescript',
    packageRoot: await findTestPackageRoot(import.meta.url),
  });
