# ube-tsp

A monorepo containing TypeSpec tools for modern API development: a TypeScript emitter that generates namespace-structured code and a Ky HTTP client generator.

> **Note**: This library was developed with assistance from Claude AI to demonstrate modern TypeSpec emitter patterns using the Alloy-JS framework.

## Packages

### [@ube-tsp/ky-emitter](./packages/ky-emitter)
A TypeSpec emitter that generates TypeScript files with namespace structure using Alloy-JS. Creates organized TypeScript code that mirrors your TypeSpec namespace hierarchy, plus operation maps for client generation.

### [@ube-tsp/ky-client](./packages/ky-client) 
A Ky-based HTTP client generator that creates type-safe clients from operation maps. Transforms flat operation keys into nested client methods with full type safety.

## Features

- 🏗️ **Namespace Structure**: Generates TypeScript that follows your TypeSpec namespace organization
- 🔧 **JSX-based Code Generation**: Uses Alloy-JS with JSX components for maintainable code generation
- 📝 **Complete Type Mapping**: Supports models, enums, unions, scalars, and arrays
- 🗺️ **Operation Maps**: Generates runtime operation metadata for client generation
- ⚡ **Modern Architecture**: Built with TypeSpec emitter framework and Alloy-JS
- 🚀 **HTTP Operations**: Generates complete operation definitions with request/response types
- 🌐 **Type-Safe HTTP Client**: Ky-based client with nested method calls and full TypeScript support

## Quick Start

### Install Packages

```bash
# Install the emitter
npm install @ube-tsp/ky-emitter

# Install the HTTP client generator  
npm install @ube-tsp/ky-client
```

### Configure TypeSpec

```yaml
# tspconfig.yaml
emit:
  - "@ube-tsp/ky-emitter"
```

### Generate Code

```bash
tsp compile .
```

### Use Generated Client

```typescript
import ky from 'ky';
import { createClient } from '@ube-tsp/ky-client';
import { operationMap, type OperationMap } from './generated/operation-map.js';

// Create Ky instance
const kyInstance = ky.create({ 
  prefixUrl: 'https://api.example.com' 
});

// Create type-safe client
const client = createClient<OperationMap>(kyInstance, operationMap);

// Use nested client methods (transforms flat keys into nested structure)
const pet = await client.PetStore.getPet({ 
  params: { path: { petId: 123 } } 
});
```

## Output Structure

The emitter generates namespace-structured TypeScript files:

```
tsp-output/
└── @ube-tsp/
    └── @ky-emitter/
        ├── operation-map.ts           # Runtime operation metadata
        ├── Spec.ts                    # Root namespace types
        └── Spec/
            ├── PetStore.ts            # PetStore namespace types & operations
            └── PetStore/              # More nested namespace
```

### Generated Code Example

```typescript
// Spec/PetStore.ts
export type Pet = {
  name: string;
};

export const getPet = {
  operationId: "getPet",
  method: "GET",
  path: "/pet/{petId}",
  statusCodes: [200],
};

export type GetPetRequest = {
  params: {
    path: { petId: number };
    query?: never;
    header?: never;
  };
  body?: never;
};

export type GetPetResponse = {
  statusCode: 200;
  contentType: "application/json";
  content: Pet;
};
```

## Type Mapping

| TypeSpec Type | TypeScript Type |
|---------------|-----------------|
| `string` | `string` |
| `int32`, `float64` | `number` |
| `boolean` | `boolean` |
| `Model` | `interface` |
| `Enum` | `enum` |
| `Union` | `type` alias |
| `Array<T>` | `T[]` |
| Custom scalars | `unknown` |

## Monorepo Development

This monorepo is built using:

- **[@alloy-js/core](https://alloy-framework.github.io/alloy/)**: JSX-based code generation framework
- **[@typespec/emitter-framework](https://typespec.io/)**: TypeSpec emitter utilities
- **[ky](https://github.com/sindresorhus/ky)**: Modern HTTP client based on fetch
- **TypeScript**: Modern JavaScript with types
- **npm workspaces**: Monorepo package management

### Build Commands

```bash
# Build all packages
npm run build

# Test all packages
npm run test

# Lint all packages
npm run lint

# Format code
npm run format
```

### Package-Specific Development

```bash
# Work on the emitter
cd packages/ky-emitter
npm run build
npm run test

# Work on the ky-client
cd packages/ky-client  
npm run build
npm run test
```

## Contributing

Contributions are welcome! This project follows standard TypeScript and TypeSpec conventions.

## License

MIT

---

*This emitter was developed with assistance from Claude AI to demonstrate modern TypeSpec emitter patterns and JSX-based code generation.*
