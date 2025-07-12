import {
  createTestWrapper,
  createTestHost as coreCreateTestHost,
} from '@typespec/compiler/testing';
import { HttpTestLibrary } from '@typespec/http/testing';
import { TypeScriptEmitterTestLibrary } from '../dist/src/testing/index.js';

export async function createTestHost(includeHttp = true) {
  return coreCreateTestHost({
    libraries: [
      TypeScriptEmitterTestLibrary,
      ...(includeHttp ? [HttpTestLibrary] : []),
    ],
  });
}

export async function createTestRunner(
  emitterOptions = {},
  includeHttp = true,
) {
  const host = await createTestHost(includeHttp);

  const importAndUsings = includeHttp
    ? `import "@typespec/http"; using TypeSpec.Http;\n`
    : ``;

  return createTestWrapper(host, {
    wrapper: (code) => `${importAndUsings} ${code}`,
    compilerOptions: {
      emit: ['typespec-typescript-emitter'],
      options: {
        'typespec-typescript-emitter': { ...emitterOptions },
      },
    },
  });
}

export async function readGeneratedFile(
  runner: any,
  path: string,
): Promise<string> {
  const { text } = await runner.program.host.readFile(
    `typespec-typescript-emitter/${path}`,
  );
  return text;
}
