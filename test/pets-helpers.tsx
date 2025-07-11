import { createTypeScriptEmitterTestRunner } from "./utils.jsx";

export async function compilePetsApi(source: string) {
  const runner = await createTypeScriptEmitterTestRunner();
  await runner.compile(`
    import "@typespec/http";
    using TypeSpec.Http;
    
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