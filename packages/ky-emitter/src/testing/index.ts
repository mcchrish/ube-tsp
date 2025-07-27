import { createTestLibrary, findTestPackageRoot, type TypeSpecTestLibrary } from "@typespec/compiler/testing";

export const TypeScriptEmitterTestLibrary: TypeSpecTestLibrary = createTestLibrary({
  name: "@ube-tsp/ky-emitter",
  packageRoot: await findTestPackageRoot(import.meta.url),
});
