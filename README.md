# ube-tsp

🚀 **TypeScript emitter with namespace structure and Ky HTTP client generator for TypeSpec.**

Transform your TypeSpec definitions into production-ready, type-safe HTTP clients with zero runtime overhead.

## ✨ Features

- **🏗️ Namespace-Aware** - Preserves your TypeSpec namespace hierarchy in generated TypeScript code
- **🔒 Fully Type-Safe** - Complete end-to-end type safety from API definition to client usage
- **⚡ Zero Runtime Overhead** - Generates lightweight clients with minimal bundle impact
- **🎯 Modern & Fast** - Built on Ky for modern fetch-based HTTP requests
- **🛠️ Developer Experience** - IntelliSense, auto-completion, and compile-time error checking
- **📦 Production Ready** - Used in production environments with robust error handling

Perfect for teams who want to maintain API contracts while building fast, reliable TypeScript applications.

## Packages

- **[@ube-tsp/ky-emitter](./packages/ky-emitter)** - TypeSpec emitter generating namespace-structured TypeScript
- **[@ube-tsp/ky-client](./packages/ky-client)** - Type-safe HTTP client generator

## Quick Start

### 1. Install the emitter

```bash
npm install @ube-tsp/ky-emitter
```

### 2. Configure TypeSpec

```yaml
# tspconfig.yaml
emit:
  - "@ube-tsp/ky-emitter"
```

### 3. Compile your TypeSpec

```bash
tsp compile .
```

### 4. Use the generated client

```bash
npm install @ube-tsp/ky-client ky
```

```typescript
import ky from "ky";
import { createClient } from "@ube-tsp/ky-client";
import { operationMap, type OperationMap } from "./generated/operation-map.js";

const kyInstance = ky.create({ prefixUrl: "https://api.example.com" });
const client = createClient<OperationMap>(kyInstance, operationMap);

// Use nested methods based on your TypeSpec namespaces
await client.PetStore.getPet({ params: { path: { petId: 123 } } });
```

## 🔧 More Usage

### Custom Ky Configuration

Pass additional Ky options for advanced scenarios:

```typescript
// Custom timeout and headers
const result = await client.PetStore.getPet(
  { params: { path: { petId: 123 } } },
  {
    timeout: 5000,
    headers: { Authorization: "Bearer token" },
    retry: { limit: 3 },
  },
);

// Global configuration
const kyInstance = ky.create({
  prefixUrl: "https://api.example.com",
  timeout: 10000,
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set("User-Agent", "MyApp/1.0");
      },
    ],
  },
});
```

### Nested Namespaces

```typescript
// For deeply nested TypeSpec namespaces
await client.Store.Inventory.Products.getProduct({
  params: { path: { productId: "abc123" } },
});

await client.Admin.Users.Permissions.grantPermission({
  params: {
    path: { userId: 456, permissionId: 789 },
    body: { reason: "Promotion to manager" },
  },
});
```

## How it works

The emitter generates:

- **Namespace-structured TypeScript types** - Mirrors your TypeSpec namespace hierarchy
- **Runtime operation map** - Contains HTTP method, path, and status code information
- **Type-safe client methods** - Automatically creates nested client structure from flat operation keys

### Output Structure

For a TypeSpec like:

```typespec
@service({
  title: "Pet Store API",
})
namespace PetStore {
  @route("/pets/{petId}")
  op getPet(@path petId: int32): Pet | NotFoundError;
}
```

The emitter generates:

```
generated/
├── Spec.ts              # Namespace-structured types
├── operation-map.ts     # Runtime operation mapping
└── Spec/
    └── PetStore.ts      # PetStore namespace types
```

The operation map contains:

```typescript
export const operationMap = {
  "PetStore.getPet": {
    path: "/pets/{petId}",
    method: "GET",
    statusCodes: [200, 404],
  },
};
```

The client transforms this into:

```typescript
// Typed as: (params: { path: { petId: number } }) => Promise<ApiResponse>
client.PetStore.getPet({ params: { path: { petId: 123 } } });
```

## Development

```bash
npm run build    # Build all packages
npm run test     # Test all packages
npm run lint     # Lint all packages
npm run format   # Format code
```

## Credits

Based on [typespec-zod](https://github.com/bterlson/typespec-zod) implementation patterns. Built with AI assistance from Claude Code.

## License

MIT
