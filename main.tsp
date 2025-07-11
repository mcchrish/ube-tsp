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

@route("/pets")
interface Pets {
  // GET with query parameters
  @get 
  listPets(@query status?: string, @query limit?: int32): Pet[];
  
  // POST with body
  @post 
  createPet(@body pet: CreatePetRequest): Pet;
  
  // GET with path parameter
  @get 
  getPet(@path petId: int32): Pet;
  
  // PUT with path and body
  @put 
  updatePet(@path petId: int32, @body pet: Pet): Pet;
  
  // DELETE with path parameter
  @delete 
  deletePet(@path petId: int32): void;
  
  // GET with header parameter
  @get 
  @route("/search")
  searchPets(@header authorization: string, @query q: string): Pet[];
}