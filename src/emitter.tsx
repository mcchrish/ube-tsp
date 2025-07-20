import { SourceFile, tsNameConflictResolver } from '@alloy-js/typescript';
import { type EmitContext } from '@typespec/compiler';
import { Output, writeOutput } from '@typespec/emitter-framework';
import { Spec } from './components/spec.jsx';
import { createTSNamePolicy } from './name-policy.js';

export async function $onEmit(context: EmitContext) {
  const tsNamePolicy = createTSNamePolicy();

  writeOutput(
    context.program,
    <Output
      program={context.program}
      namePolicy={tsNamePolicy}
      nameConflictResolver={tsNameConflictResolver}
    >
      <SourceFile path={'api.ts'}>
        <Spec />
      </SourceFile>
    </Output>,
    context.emitterOutputDir,
  );
}
