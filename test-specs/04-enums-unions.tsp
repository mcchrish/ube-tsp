import "@typespec/http";

using TypeSpec.Http;

@service
namespace EnumsUnions;

// String enums
enum UserRole {
  ADMIN: "admin",
  MODERATOR: "moderator", 
  USER: "user",
  GUEST: "guest"
}

// Numeric enums
enum Priority {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
}

// Auto-valued enums
enum Status {
  ACTIVE,
  INACTIVE,
  PENDING,
  SUSPENDED
}

// Union types
union StringOrNumber {
  string,
  int32
}

union Result {
  success: SuccessResponse,
  error: ErrorResponse
}

model SuccessResponse {
  type: "success";
  data: Record<unknown>;
  timestamp: utcDateTime;
}

model ErrorResponse {
  type: "error";
  code: int32;
  message: string;
  details?: Record<string>;
}

// Discriminated unions
union Animal {
  dog: Dog,
  cat: Cat,
  bird: Bird
}

model Dog {
  type: "dog";
  breed: string;
  bark: boolean;
}

model Cat {
  type: "cat";
  breed: string;
  meow: boolean;
}

model Bird {
  type: "bird";
  species: string;
  canFly: boolean;
}

// Complex model using enums and unions
model Task {
  id: int32;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  assignedTo?: User;
  metadata: StringOrNumber;
  result?: Result;
}

model User {
  id: int32;
  name: string;
  email: string;
  role: UserRole;
  pet?: Animal;
}

@route("/tasks")
interface TaskOperations {
  @get getTasks(@query status?: Status, @query priority?: Priority): Task[];
  @post createTask(@body task: Task): Task;
}

@route("/users")
interface UserOperations {
  @get getUsers(@query role?: UserRole): User[];
  @post createUser(@body user: User): User;
}

@route("/animals")
interface AnimalOperations {
  @get getAnimals(): Animal[];
}