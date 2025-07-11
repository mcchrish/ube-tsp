import "@typespec/http";

using TypeSpec.Http;

@service
namespace ComplexModels;

// Model inheritance
model BaseEntity {
  id: int32;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  age?: int32;
}

model Organization extends BaseEntity {
  name: string;
  description?: string;
  users: User[];
}

// Nested models
model Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

model Contact {
  email: string;
  phone?: string;
  address: Address;
}

model Customer extends User {
  contact: Contact;
  orders: Order[];
}

// Model with complex types
model Order {
  id: int32;
  customerId: int32;
  items: OrderItem[];
  total: decimal;
  status: OrderStatus;
  metadata?: Record<string>;
}

model OrderItem {
  productId: int32;
  quantity: int32;
  price: decimal;
  discount?: decimal;
}

enum OrderStatus {
  PENDING: "pending",
  PROCESSING: "processing", 
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
}

// Union types
union PaymentMethod {
  creditCard: CreditCard,
  paypal: PayPalAccount,
  bankTransfer: BankAccount
}

model CreditCard {
  type: "credit_card";
  number: string;
  expiryMonth: int32;
  expiryYear: int32;
  cvv: string;
}

model PayPalAccount {
  type: "paypal";
  email: string;
}

model BankAccount {
  type: "bank_transfer";
  accountNumber: string;
  routingNumber: string;
}

// Template models
model Response<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

model PaginatedResponse<T> {
  items: T[];
  total: int32;
  page: int32;
  limit: int32;
  hasNext: boolean;
}

@route("/complex")
interface ComplexOperations {
  @get getUser(@path userId: int32): Response<User>;
  @get getOrganization(@path orgId: int32): Response<Organization>;
  @get getCustomer(@path customerId: int32): Response<Customer>;
  @get getOrders(@query limit?: int32, @query page?: int32): PaginatedResponse<Order>;
  @post createOrder(@body order: Order): Response<Order>;
}