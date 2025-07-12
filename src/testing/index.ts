import {
  createTestLibrary,
  TypeSpecTestLibrary,
} from '@typespec/compiler/testing';
import { fileURLToPath } from 'url';

export const TypeScriptEmitterTestLibrary: TypeSpecTestLibrary =
  createTestLibrary({
    name: 'typespec-typescript-emitter',
    packageRoot: fileURLToPath(new URL('../../', import.meta.url)),
  });
