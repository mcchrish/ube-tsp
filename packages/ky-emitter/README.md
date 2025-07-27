# @ube-tsp/ky-emitter

A TypeSpec emitter that generates TypeScript files with namespace structure using Alloy-JS. This emitter creates organized TypeScript code that mirrors your TypeSpec namespace hierarchy, along with operation maps for type-safe HTTP client generation.

## Features

- 🏗️ **Namespace Structure**: Generates TypeScript files that follow your TypeSpec namespace organization
- 🔧 **JSX-based Code Generation**: Uses Alloy-JS with JSX components for maintainable code generation
- 📝 **Complete Type Mapping**: Supports models, enums, unions, scalars, and arrays
- 🗺️ **Operation Maps**: Generates runtime operation metadata for client generation
- ⚡ **Modern Architecture**: Built with TypeSpec emitter framework and Alloy-JS
- 🚀 **HTTP Operations**: Generates complete operation definitions with request/response types

## Installation

```bash
npm install @ube-tsp/ky-emitter
```

## Usage

Add the emitter to your TypeSpec configuration:

```yaml
# tspconfig.yaml
emit:
  - "@ube-tsp/ky-emitter"
```

Then compile your TypeSpec:

```bash
tsp compile .
```

## Output Structure

The emitter generates namespace-structured TypeScript files:

```
tsp-output/
└── @ube-tsp/
    └── ky-emitter/
        ├── operation-map.ts           # Runtime operation metadata
        ├── Spec.ts                    # Root namespace types
        └── Spec/
            ├── PetStore.ts            # PetStore namespace types & operations
            └── PetStore/
                ├── Models.ts          # Nested namespace types
                └── Operations.ts      # More operations
```

### Generated Code Example

```typescript
// Spec/PetStore.ts
export type Pet = {
  name: string;
};

export type Tag = {
  value: string;
};

export const getPet = {
  operationId: "getPet",
  method: "GET",
  path: "/pet/{petId}",
  statusCodes: [200],
};

export type GetPetRequest = {
  params: {
    path: {
      petId: number;
    };
    query?: never;
    header?: never;
    cookie?: never;
  };
  body?: never;
};

export type GetPetResponse = {
  statusCode: 200;
  contentType: "application/json";
  headers?: never;
  content: Pet;
};
```

### Operation Map Example

```typescript
// operation-map.ts
export const operationMap = {
  "PetStore.getPet": {
    operationId: "getPet",
    method: "GET",
    path: "/pet/{petId}",
    statusCodes: [200],
  },
  "PetStore.createPet": {
    operationId: "createPet", 
    method: "POST",
    path: "/pet",
    statusCodes: [201],
  },
} as const;
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

## Development

```bash
# Build the emitter
npm run build

# Watch mode during development  
npm run watch

# Run tests
npm run test

# Lint code
npm run lint
```

## License

MIT