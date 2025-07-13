import { expect } from 'vitest';
import {
  createTestWrapper,
  createTestHost as coreCreateTestHost,
  BasicTestRunner,
} from '@typespec/compiler/testing';
import { HttpTestLibrary } from '@typespec/http/testing';
import { TypeScriptEmitterTestLibrary } from '../src/testing/index.js';

export async function createTestHost() {
  return coreCreateTestHost({
    libraries: [TypeScriptEmitterTestLibrary, HttpTestLibrary],
  });
}

export async function createTestRunner(emitterOptions = {}) {
  const host = await createTestHost();

  const importAndUsings = `import "@typespec/http"; using TypeSpec.Http;\n`;

  return createTestWrapper(host, {
    wrapper: (code) => `${importAndUsings} ${code}`,
    compilerOptions: {
      emit: ['typespec-typescript'],
      options: {
        'typespec-typescript': { ...emitterOptions },
      },
    },
  });
}

export async function readGeneratedFile(
  runner: BasicTestRunner,
  path: string,
): Promise<string> {
  const { text } = await runner.program.host.readFile(
    `typespec-typescript-emitter/${path}`,
  );
  return text;
}

/**
 * Read a specific operation file
 */
export async function readOperationFile(
  runner: BasicTestRunner,
  operationName: string,
): Promise<string> {
  return readGeneratedFile(runner, `api/operations/${operationName}.ts`);
}

/**
 * Parse an operation file content into interface and config parts
 */
export function parseOperationFile(content: string): {
  interfaceContent: string;
  configContent: string;
  interfaceName: string;
  configName: string;
} {
  const lines = content.split('\n');

  let interfaceStartIdx = -1;
  let interfaceEndIdx = -1;
  let configStartIdx = -1;
  let configEndIdx = -1;

  // Find interface boundaries
  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].startsWith('export interface ') &&
      lines[i].includes('Types')
    ) {
      interfaceStartIdx = i;
    }
    if (interfaceStartIdx >= 0 && lines[i] === '};' && interfaceEndIdx === -1) {
      interfaceEndIdx = i;
    }
    if (lines[i].startsWith('export const ') && lines[i].includes(' = {')) {
      configStartIdx = i;
    }
    if (configStartIdx >= 0 && lines[i] === '} as const;') {
      configEndIdx = i;
      break;
    }
  }

  const interfaceContent = lines
    .slice(interfaceStartIdx, interfaceEndIdx + 1)
    .join('\n');
  const configContent = lines
    .slice(configStartIdx, configEndIdx + 1)
    .join('\n');

  // Extract names
  const interfaceMatch = interfaceContent.match(/export interface (\w+)/);
  const configMatch = configContent.match(/export const (\w+)/);

  return {
    interfaceContent,
    configContent,
    interfaceName: interfaceMatch?.[1] || '',
    configName: configMatch?.[1] || '',
  };
}

/**
 * Validate that an operation file has the correct structure
 */
export function validateOperationStructure(content: string): void {
  const parsed = parseOperationFile(content);

  if (!parsed.interfaceName) {
    throw new Error('Missing Types interface in operation file');
  }

  if (!parsed.configName) {
    throw new Error('Missing config object in operation file');
  }

  // Validate interface has required properties
  const requiredProps = [
    'pathParams',
    'queryParams',
    'headers',
    'body',
    'responses',
  ];
  for (const prop of requiredProps) {
    if (!parsed.interfaceContent.includes(prop)) {
      throw new Error(`Missing ${prop} in Types interface`);
    }
  }

  // Validate config has required properties
  const requiredConfigProps = ['operationId', 'method', 'path'];
  for (const prop of requiredConfigProps) {
    if (!parsed.configContent.includes(prop)) {
      throw new Error(`Missing ${prop} in config object`);
    }
  }
}

/**
 * Extract specific type definition from interface
 */
export function extractTypeFromInterface(
  interfaceContent: string,
  propertyName: string,
): string {
  const regex = new RegExp(`${propertyName}\\??:\\s*([^;]+);`);
  const match = interfaceContent.match(regex);
  return match?.[1]?.trim() || '';
}

/**
 * Extract config property value
 */
export function extractConfigProperty(
  configContent: string,
  propertyName: string,
): string {
  const regex = new RegExp(`${propertyName}:\\s*([^,}]+)`);
  const match = configContent.match(regex);
  return match?.[1]?.trim() || '';
}

/**
 * Assert that actual output exactly matches expected output
 */
export function expectExactOutput(
  actualOutput: string,
  expectedOutput: string,
  description?: string,
): void {
  expect(actualOutput, description || 'Output should match expected').toBe(
    expectedOutput,
  );
}

/**
 * Assert that a specific section appears exactly in the actual output
 */
export function expectSectionMatch(
  actualOutput: string,
  expectedSection: string,
  description?: string,
): void {
  expect(
    actualOutput,
    `${description || 'Section'} should be found in output`,
  ).toContain(expectedSection);
}

/**
 * Read operation file and validate it matches expected output exactly
 */
export async function readAndValidateComplete(
  runner: BasicTestRunner,
  operationName: string,
  expectedOutput: string,
): Promise<void> {
  const content = await readOperationFile(runner, operationName);
  expectExactOutput(
    content,
    expectedOutput,
    `${operationName} complete operation`,
  );
}

/**
 * Read operation file and validate a specific section appears correctly
 */
export async function readAndValidateSection(
  runner: BasicTestRunner,
  operationName: string,
  expectedSection: string,
  sectionDescription: string,
): Promise<void> {
  const content = await readOperationFile(runner, operationName);
  expectSectionMatch(
    content,
    expectedSection,
    `${operationName} ${sectionDescription}`,
  );
}

/**
 * Create emitter test runner for full integration tests
 */
export async function createEmitterTestRunner(emitterOptions = {}) {
  const host = await createTestHost();

  const importAndUsings = `import "@typespec/http"; using TypeSpec.Http;\n`;

  return createTestWrapper(host, {
    wrapper: (code) => `${importAndUsings} ${code}`,
    compilerOptions: {
      emit: ['typespec-typescript'],
      options: {
        'typespec-typescript': { ...emitterOptions },
      },
    },
  });
}
