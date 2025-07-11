import "@typespec/http";

using TypeSpec.Http;

@service
namespace BasicTypes;

// Basic scalar types
model BasicScalars {
  stringProp: string;
  intProp: int32;
  floatProp: float64;
  booleanProp: boolean;
  optionalString?: string;
}

// Arrays
model ArrayTypes {
  stringArray: string[];
  numberArray: int32[];
  nestedArray: string[][];
}

// Simple operations
@route("/basic")
interface BasicOperations {
  @get getBasic(): BasicScalars;
  @post createBasic(@body data: BasicScalars): BasicScalars;
}

@route("/arrays")
interface ArrayOperations {
  @get getArray(): ArrayTypes;
}