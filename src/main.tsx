import { EmitContext, Model, ModelProperty, Operation, Type } from "@typespec/compiler";
import { getModels, getOperations, mapTypeSpecToTypeScript } from "./lib.js";
import { $query, $path, $header } from "@typespec/http";

export async function $onEmit(context: EmitContext) {
  const models = getModels(context);
  let schemasContent = "";

  for (const model of models) {
    schemasContent += `export interface ${model.name} {\n`;
    for (const prop of model.properties.values()) {
      schemasContent += `  ${prop.name}${prop.optional ? "?" : ""}: ${mapTypeSpecToTypeScript(prop.type)};\n`;
    }
    schemasContent += `}\n\n`;
  }

  await context.program.host.writeFile(
    `${context.emitterOutputDir}/api/schemas.ts`,
    schemasContent
  );

  const operations = getOperations(context);

  for (const operation of operations) {
    let operationContent = `const operationId = '${operation.name}' as const;\n`;

    if (operation.parameters.kind === "Model") {
      const queryParams: ModelProperty[] = [];
      const pathParams: ModelProperty[] = [];
      const headerParams: ModelProperty[] = [];

      for (const param of operation.parameters.properties.values()) {
        const decorators = param.decorators.map(d => d.decorator.name);
        if (decorators.includes($query.name)) {
          queryParams.push(param);
        } else if (decorators.includes($path.name)) {
          pathParams.push(param);
        } else if (decorators.includes($header.name)) {
          headerParams.push(param);
        }
      }

      if (queryParams.length > 0) {
        operationContent += `interface QueryParams {\n`;
        for (const param of queryParams) {
          operationContent += `  ${param.name}${param.optional ? "?" : ""}: ${mapTypeSpecToTypeScript(param.type)};\n`;
        }
        operationContent += `}\n\n`;
      }

      if (pathParams.length > 0) {
        operationContent += `interface PathParams {\n`;
        for (const param of pathParams) {
          operationContent += `  ${param.name}${param.optional ? "?" : ""}: ${mapTypeSpecToTypeScript(param.type)};\n`;
        }
        operationContent += `}\n\n`;
      }

      if (headerParams.length > 0) {
        operationContent += `interface HeaderParams {\n`;
        for (const param of headerParams) {
          operationContent += `  ${param.name}${param.optional ? "?" : ""}: ${mapTypeSpecToTypeScript(param.type)};\n`;
        }
        operationContent += `}\n\n`;
      }
    }

    // Generate Response interfaces
    if (operation.returnType.kind === "Model") {
      if (operation.returnType.indexer && operation.returnType.indexer.value) {
        // Handle array return types (e.g., Pet[])
        operationContent += `type Response200 = ${mapTypeSpecToTypeScript(operation.returnType.indexer.value)}[];\n\n`;
      } else {
        operationContent += `interface Response200 {\n`;
        for (const prop of operation.returnType.properties.values()) {
          operationContent += `  ${prop.name}${prop.optional ? "?" : ""}: ${mapTypeSpecToTypeScript(prop.type)};\n`;
        }
        operationContent += `}\n\n`;
      }
    } else if (operation.returnType.kind === "Scalar") {
      operationContent += `type Response200 = ${mapTypeSpecToTypeScript(operation.returnType)};\n\n`;
    } else if (operation.returnType.kind === "Union") {
      // Handle union types for responses
      operationContent += `type Response = ${[...operation.returnType.variants.values()].map(v => mapTypeSpecToTypeScript(v.type)).join(" | ")};\n\n`;
    }

    await context.program.host.writeFile(
      `${context.emitterOutputDir}/api/operations/${operation.name}.ts`,
      operationContent
    );
  }
}