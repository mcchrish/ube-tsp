import "@typespec/http";

using TypeSpec.Http;

@service
namespace PetStore;

model Pet {
  id: int32;
  name: string;
  tag?: string;
}

@route("/pets")
interface Pets {
  list(): Pet[];
}