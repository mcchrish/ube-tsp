# @ube-tsp/ky-client

Type-safe HTTP client generator using Ky that transforms operation maps into nested client methods.

Based on [typespec-zod](https://github.com/bterlson/typespec-zod) implementation patterns.

## Usage

```typescript
import ky from "ky";
import { createClient } from "@ube-tsp/ky-client";
import { operationMap } from "./generated/operation-map.js";

const kyInstance = ky.create({ prefixUrl: "https://api.example.com" });
const client = createClient(kyInstance, operationMap);

// Use nested methods
await client.PetStore.getPet({ params: { path: { petId: 123 } } });
```

```bash
npm install @ube-tsp/ky-client ky
```

## License

MIT
