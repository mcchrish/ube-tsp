import { SourceFile, tsNameConflictResolver } from '@alloy-js/typescript';
import { type EmitContext } from '@typespec/compiler';
import { Output, writeOutput } from '@typespec/emitter-framework';
import { NamespaceStructure } from './components/namespace.jsx';
import { createTSNamePolicy } from './name-policy.js';

export async function $onEmit(context: EmitContext) {
  const tsNamePolicy = createTSNamePolicy();

  const globalNs = context.program.getGlobalNamespaceType();

  writeOutput(
    context.program,
    <Output
      program={context.program}
      namePolicy={tsNamePolicy}
      nameConflictResolver={tsNameConflictResolver}
    >
      <SourceFile path={'api.ts'}>
        <NamespaceStructure name="Spec" ns={globalNs} />
      </SourceFile>
    </Output>,
    context.emitterOutputDir,
  );
}
