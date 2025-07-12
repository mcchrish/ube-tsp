/**
 * Expected output templates for new runtime-friendly structure
 */

export interface NewOperationExpectation {
  interfaceName: string;
  pathParams: string;
  queryParams: string;
  headers: string;
  body: string;
  responses: string;
  configName: string;
  operationId: string;
  method: string;
  path: string;
  parameterTypes: {
    hasPathParams: boolean;
    hasQueryParams: boolean;
    hasHeaders: boolean;
    hasBody: boolean;
  };
  statusCodes: number[];
}

export function formatNewOperationExpectation(
  expectation: NewOperationExpectation,
): string {
  const parts: string[] = [];

  // Types interface
  parts.push(`export interface ${expectation.interfaceName} {`);
  parts.push(
    `  pathParams${expectation.pathParams === 'never' ? '?' : ''}: ${expectation.pathParams};`,
  );
  parts.push(
    `  queryParams${expectation.queryParams === 'never' ? '?' : ''}: ${expectation.queryParams};`,
  );
  parts.push(
    `  headers${expectation.headers === 'never' ? '?' : ''}: ${expectation.headers};`,
  );
  parts.push(
    `  body${expectation.body === 'never' ? '?' : ''}: ${expectation.body};`,
  );
  parts.push(`  responses: ${expectation.responses};`);
  parts.push('};');

  // Config object
  parts.push(`export const ${expectation.configName} = {`);
  parts.push(`  operationId: '${expectation.operationId}',`);
  parts.push(`  method: '${expectation.method}' as const,`);
  parts.push(`  path: '${expectation.path}',`);
  parts.push('  parameterTypes: {');
  parts.push(`    hasPathParams: ${expectation.parameterTypes.hasPathParams},`);
  parts.push(
    `    hasQueryParams: ${expectation.parameterTypes.hasQueryParams},`,
  );
  parts.push(`    hasHeaders: ${expectation.parameterTypes.hasHeaders},`);
  parts.push(`    hasBody: ${expectation.parameterTypes.hasBody}`);
  parts.push('  },');
  parts.push(`  statusCodes: [${expectation.statusCodes.join(', ')}]`);
  parts.push('} as const;');

  return parts.join('\n');
}

// Common expectations for flattened structure
export const EXPECTED_OPERATIONS = {
  getPet: (): OperationExpectation => ({
    operationId: 'getPet',
    method: 'GET',
    path: '/pets/{petId}',
    interfaces: {
      PathParams: {
        petId: 'number',
      },
    },
    responseType:
      '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}',
    operationConfig: {
      operationId: 'getPet',
      method: 'GET',
      path: '/pets/{petId}',
      parameters: { path: true },
      responses: [200],
    },
  }),

  listPets: (): OperationExpectation => ({
    operationId: 'listPets',
    method: 'GET',
    path: '/pets',
    interfaces: {
      QueryParams: {
        'status?': 'string',
        'limit?': 'number',
      },
    },
    responseType:
      '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}[]',
    operationConfig: {
      operationId: 'listPets',
      method: 'GET',
      path: '/pets',
      parameters: { query: true },
      responses: [200],
    },
  }),

  createPet: (): OperationExpectation => ({
    operationId: 'createPet',
    method: 'POST',
    path: '/pets',
    interfaces: {
      RequestBody: {
        pet: '{\n  name: string;\n  tag?: string;\n}',
      },
    },
    responseType:
      '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}',
    operationConfig: {
      operationId: 'createPet',
      method: 'POST',
      path: '/pets',
      parameters: { body: true },
      responses: [200],
    },
  }),

  updatePet: (): OperationExpectation => ({
    operationId: 'updatePet',
    method: 'PUT',
    path: '/pets/{petId}',
    interfaces: {
      PathParams: {
        petId: 'number',
      },
      RequestBody: {
        pet: '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}',
      },
    },
    responseType:
      '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}',
    operationConfig: {
      operationId: 'updatePet',
      method: 'PUT',
      path: '/pets/{petId}',
      parameters: { path: true, body: true },
      responses: [200],
    },
  }),

  deletePet: (): OperationExpectation => ({
    operationId: 'deletePet',
    method: 'DELETE',
    path: '/pets/{petId}',
    interfaces: {
      PathParams: {
        petId: 'number',
      },
    },
    responseType: 'void',
    operationConfig: {
      operationId: 'deletePet',
      method: 'DELETE',
      path: '/pets/{petId}',
      parameters: { path: true },
      responses: [200],
    },
  }),

  searchPets: (): OperationExpectation => ({
    operationId: 'searchPets',
    method: 'GET',
    path: '/pets/search',
    interfaces: {
      QueryParams: {
        q: 'string',
      },
      HeaderParams: {
        authorization: 'string',
      },
    },
    responseType:
      '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}[]',
    operationConfig: {
      operationId: 'searchPets',
      method: 'GET',
      path: '/pets/search',
      parameters: { query: true, header: true },
      responses: [200],
    },
  }),
};

// New expectations for runtime-friendly structure
export const NEW_EXPECTED_OPERATIONS = {
  getPet: (): NewOperationExpectation => ({
    interfaceName: 'GetPetTypes',
    pathParams: '{ petId: number }',
    queryParams: 'never',
    headers: 'never',
    body: 'never',
    responses:
      '{ 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } }',
    configName: 'getPet',
    operationId: 'getPet',
    method: 'GET',
    path: '/pets/{petId}',
    parameterTypes: {
      hasPathParams: true,
      hasQueryParams: false,
      hasHeaders: false,
      hasBody: false,
    },
    statusCodes: [200],
  }),

  createPet: (): NewOperationExpectation => ({
    interfaceName: 'CreatePetTypes',
    pathParams: 'never',
    queryParams: 'never',
    headers: 'never',
    body: '{ pet: { name: string; tag?: string } }',
    responses:
      '{ 200: { id: number; name: string; tag?: string; status: "available" | "pending" | "sold" } }',
    configName: 'createPet',
    operationId: 'createPet',
    method: 'POST',
    path: '/pets',
    parameterTypes: {
      hasPathParams: false,
      hasQueryParams: false,
      hasHeaders: false,
      hasBody: true,
    },
    statusCodes: [200],
  }),
};
