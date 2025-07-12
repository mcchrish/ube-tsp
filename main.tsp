import "@typespec/http";

using TypeSpec.Http;

@service
namespace HttpOperations;

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

@route("/pets")
interface PetStore {
  @get 
  listPets(@query status?: string, @query limit?: int32): Pet[];
  
  @post 
  createPet(@body pet: CreatePetRequest): Pet;
  
  @get 
  getPet(@path petId: int32): Pet;
  
  @put 
  updatePet(@path petId: int32, @body pet: Pet): Pet;
  
  @delete 
  deletePet(@path petId: int32): void;
}