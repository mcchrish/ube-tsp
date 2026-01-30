import { SourceFile, tsNameConflictResolver } from "@alloy-js/typescript";
import { type EmitContext } from "@typespec/compiler";
import { Output, writeOutput } from "@typespec/emitter-framework";
import "@typespec/http/experimental/typekit";
import { NamespaceStructure } from "./components/namespace.jsx";
import { OperationMap } from "./components/operation-map.jsx";
import { createTSNamePolicy } from "./name-policy.js";

export async function $onEmit(context: EmitContext) {
  const tsNamePolicy = createTSNamePolicy();

  const globalNs = context.program.getGlobalNamespaceType();

  writeOutput(
    context.program,
    <Output program={context.program} namePolicy={tsNamePolicy} nameConflictResolver={tsNameConflictResolver}>
      <NamespaceStructure name="Spec" ns={globalNs} />
      <SourceFile path="operation-map.ts">
        <OperationMap ns={globalNs} />
      </SourceFile>
    </Output>,
    context.emitterOutputDir,
  );
}
