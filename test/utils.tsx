import { createTestLibrary, createTestWrapper, createTestHost } from "@typespec/compiler/testing";
import { HttpTestLibrary } from "@typespec/http/testing";
import { fileURLToPath } from "url";

export const EmitterTestLibrary = createTestLibrary({
  name: "TypeScript Emitter Test Library",
  packageRoot: fileURLToPath(new URL("../", import.meta.url)),
  emitters: {
    "typespec-typescript-emitter": await import("../dist/src/emitter.js"),
  },
});

export async function createTypeScriptEmitterTestRunner() {
  const host = await createTestHost({
    libraries: [EmitterTestLibrary, HttpTestLibrary],
  });

  return createTestWrapper(host, {
    wrapper: (code) => code,
    compilerOptions: {
      emit: ["typespec-typescript-emitter"],
      options: {
        "typespec-typescript-emitter": {},
      },
    },
  });
}

export async function readGeneratedFile(runner: any, path: string): Promise<string> {
  const { text } = await runner.program.host.readFile(path);
  return text;
}