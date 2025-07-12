/**
 * Expected output templates for operation files
 */

export interface OperationExpectation {
  imports?: string[];
  operationId: string;
  method: string;
  path: string;
  interfaces?: Record<string, Record<string, string>>;
  responseType: string;
  operationConfig: {
    operationId: string;
    method: string;
    path: string;
    parameters?: Record<string, boolean>;
    responses: number[];
  };
}

export function formatExpectedOperation(expectation: OperationExpectation): string {
  const parts: string[] = [];

  // Add operation constants
  parts.push(`export const operationId = '${expectation.operationId}' as const;`);
  parts.push(`export const method = '${expectation.method}' as const;`);
  parts.push(`export const path = '${expectation.path}' as const;`);

  // Add interfaces
  if (expectation.interfaces) {
    parts.push(''); // Empty line before interfaces
    Object.entries(expectation.interfaces).forEach(([interfaceName, properties]) => {
      parts.push(`export interface ${interfaceName} {`);
      Object.entries(properties).forEach(([propName, propType]) => {
        parts.push(`  ${propName}: ${propType};`);
      });
      parts.push('}');
    });
  }

  // Add response type
  parts.push(''); // Empty line before response type
  parts.push(`export type Response200 = ${expectation.responseType};`);

  // Add operation configuration
  parts.push(''); // Empty line before operation
  parts.push('export const operation = {');
  parts.push(`  operationId: '${expectation.operationConfig.operationId}',`);
  parts.push(`  method: '${expectation.operationConfig.method}',`);
  parts.push(`  path: '${expectation.operationConfig.path}',`);
  
  if (expectation.operationConfig.parameters && Object.keys(expectation.operationConfig.parameters).length > 0) {
    parts.push('  parameters: {');
    Object.entries(expectation.operationConfig.parameters).forEach(([paramType, enabled]) => {
      if (enabled) {
        parts.push(`    ${paramType}: true,`);
      }
    });
    parts.push('  },');
  }
  
  parts.push(`  responses: [${expectation.operationConfig.responses.join(', ')}],`);
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
        'petId': 'number'
      }
    },
    responseType: '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}',
    operationConfig: {
      operationId: 'getPet',
      method: 'GET',
      path: '/pets/{petId}',
      parameters: { path: true },
      responses: [200]
    }
  }),

  listPets: (): OperationExpectation => ({
    operationId: 'listPets',
    method: 'GET',
    path: '/pets',
    interfaces: {
      QueryParams: {
        'status?': 'string',
        'limit?': 'number'
      }
    },
    responseType: '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}[]',
    operationConfig: {
      operationId: 'listPets',
      method: 'GET',
      path: '/pets',
      parameters: { query: true },
      responses: [200]
    }
  }),

  createPet: (): OperationExpectation => ({
    operationId: 'createPet',
    method: 'POST',
    path: '/pets',
    interfaces: {
      RequestBody: {
        'pet': '{\n  name: string;\n  tag?: string;\n}'
      }
    },
    responseType: '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}',
    operationConfig: {
      operationId: 'createPet',
      method: 'POST',
      path: '/pets',
      parameters: { body: true },
      responses: [200]
    }
  }),

  updatePet: (): OperationExpectation => ({
    operationId: 'updatePet',
    method: 'PUT',
    path: '/pets/{petId}',
    interfaces: {
      PathParams: {
        'petId': 'number'
      },
      RequestBody: {
        'pet': '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}'
      }
    },
    responseType: '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}',
    operationConfig: {
      operationId: 'updatePet',
      method: 'PUT',
      path: '/pets/{petId}',
      parameters: { path: true, body: true },
      responses: [200]
    }
  }),

  deletePet: (): OperationExpectation => ({
    operationId: 'deletePet',
    method: 'DELETE',
    path: '/pets/{petId}',
    interfaces: {
      PathParams: {
        'petId': 'number'
      }
    },
    responseType: 'void',
    operationConfig: {
      operationId: 'deletePet',
      method: 'DELETE',
      path: '/pets/{petId}',
      parameters: { path: true },
      responses: [200]
    }
  }),

  searchPets: (): OperationExpectation => ({
    operationId: 'searchPets',
    method: 'GET',
    path: '/pets/search',
    interfaces: {
      QueryParams: {
        'q': 'string'
      },
      HeaderParams: {
        'authorization': 'string'
      }
    },
    responseType: '{\n  id: number;\n  name: string;\n  tag?: string;\n  status: "available" | "pending" | "sold";\n}[]',
    operationConfig: {
      operationId: 'searchPets',
      method: 'GET',
      path: '/pets/search',
      parameters: { query: true, header: true },
      responses: [200]
    }
  })
};