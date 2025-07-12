import { createTestRunner } from './utils.js';

export async function compilePetsApi(source: string) {
  const runner = await createTestRunner();
  await runner.compile(`
    @service
    namespace PetStore;
    
    model Pet {
      id: int32;
      name: string;
      tag?: string;
      status: "available" | "pending" | "sold";
    }
    
    model CreatePetRequest {
      name: string;
      tag?: string;
    }
    
    ${source}
  `);
  return runner;
}
