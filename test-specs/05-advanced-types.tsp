import "@typespec/http";

using TypeSpec.Http;

@service
namespace AdvancedTypes;

// Scalar constraints
@maxLength(50)
@minLength(3)
scalar ShortString extends string;

@maxValue(100)
@minValue(0)
scalar Percentage extends int32;

@pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
scalar Email extends string;

// Date/time types
scalar Timestamp extends utcDateTime;
scalar Duration extends duration;

// Records and maps
model Config {
  settings: Record<string>;
  features: Record<boolean>;
  limits: Record<int32>;
}

// Generic/template models
model ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: Timestamp;
  duration?: Duration;
}

model PagedResult<T> {
  items: T[];
  pagination: {
    page: int32;
    limit: int32;
    total: int32;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Model with all scalar types
model AllScalars {
  // Strings
  stringValue: string;
  shortString: ShortString;
  email: Email;
  
  // Numbers
  int8Value: int8;
  int16Value: int16;
  int32Value: int32;
  int64Value: int64;
  uint8Value: uint8;
  uint16Value: uint16;
  uint32Value: uint32;
  uint64Value: uint64;
  float32Value: float32;
  float64Value: float64;
  decimal128Value: decimal128;
  percentage: Percentage;
  
  // Dates
  plainDate: plainDate;
  plainTime: plainTime;
  utcDateTime: utcDateTime;
  offsetDateTime: offsetDateTime;
  timestamp: Timestamp;
  duration: Duration;
  
  // Other types
  booleanValue: boolean;
  bytesValue: bytes;
  
  // Optional values
  optionalString?: string;
  optionalNumber?: int32;
}

// Complex nested structure
model Organization {
  id: int32;
  name: ShortString;
  email: Email;
  config: Config;
  departments: Department[];
  metadata: Record<unknown>;
}

model Department {
  id: int32;
  name: ShortString;
  budget: decimal128;
  employees: Employee[];
  settings: Record<string>;
}

model Employee {
  id: int32;
  email: Email;
  firstName: ShortString;
  lastName: ShortString;
  salary: decimal128;
  startDate: plainDate;
  manager?: Employee;
  skills: string[];
  performance: Record<Percentage>;
}

@route("/config")
interface ConfigOperations {
  @get getConfig(): Config;
  @put updateConfig(@body config: Config): ApiResponse<Config>;
}

@route("/scalars")
interface ScalarOperations {
  @get getAllScalars(): AllScalars;
}

@route("/organizations")
interface OrganizationOperations {
  @get getOrganization(@path orgId: int32): ApiResponse<Organization>;
}

@route("/employees")
interface EmployeeOperations {
  @get getEmployees(@query limit?: int32, @query page?: int32): PagedResult<Employee>;
  @post createEmployee(@body employee: Employee): ApiResponse<Employee>;
}