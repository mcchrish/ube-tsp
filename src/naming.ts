import { Operation, Model, Type } from "@typespec/compiler";

/**
 * Naming strategy for consistent file and type naming
 */
export class NamingStrategy {
  /**
   * Convert a TypeSpec type name to a TypeScript interface file name
   */
  static toInterfaceFileName(name: string): string {
    return `${this.kebabCase(name)}.interface.ts`;
  }

  /**
   * Convert a TypeSpec operation name to a TypeScript operation file name
   */
  static toOperationFileName(name: string): string {
    return `${this.kebabCase(name)}.operation.ts`;
  }

  /**
   * Get the operation file name from an operation
   */
  static getOperationFileName(operation: Operation): string {
    return this.toOperationFileName(operation.name);
  }

  /**
   * Get the interface file name from a model
   */
  static getInterfaceFileName(model: Model): string {
    return this.toInterfaceFileName(model.name);
  }

  /**
   * Convert PascalCase to kebab-case
   */
  static kebabCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * Convert kebab-case to PascalCase
   */
  static pascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Convert camelCase to kebab-case
   */
  static camelToKebab(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Convert kebab-case to camelCase
   */
  static kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Generate a TypeScript interface name from a TypeSpec type
   */
  static getInterfaceName(type: Type): string {
    switch (type.kind) {
      case "Model":
        return type.name || "UnnamedModel";
      case "Union":
        return type.name || "UnnamedUnion";
      case "Enum":
        return type.name || "UnnamedEnum";
      case "Scalar":
        return type.name || "UnnamedScalar";
      default:
        return "UnknownType";
    }
  }

  /**
   * Generate parameter interface names
   */
  static getQueryParamsName(operationName: string): string {
    return `${operationName}QueryParams`;
  }

  static getPathParamsName(operationName: string): string {
    return `${operationName}PathParams`;
  }

  static getHeaderParamsName(operationName: string): string {
    return `${operationName}HeaderParams`;
  }

  static getRequestBodyName(operationName: string): string {
    return `${operationName}RequestBody`;
  }

  /**
   * Generate response interface names
   */
  static getResponseName(operationName: string, statusCode: number): string {
    return `${operationName}Response${statusCode}`;
  }

  /**
   * Generate operation constant names
   */
  static getOperationIdConstName(): string {
    return "operationId";
  }

  static getMethodConstName(): string {
    return "method";
  }

  static getPathConstName(): string {
    return "path";
  }

  /**
   * Generate import statement for interface
   */
  static getInterfaceImport(interfaceName: string): string {
    const fileName = this.toInterfaceFileName(interfaceName);
    return `import type { ${interfaceName} } from './${fileName.replace('.ts', '.js')}';`;
  }

  /**
   * Generate import statement for common types
   */
  static getCommonTypesImport(): string {
    return `import type { HTTPMethod, StatusCode } from './common.types.js';`;
  }

  /**
   * Sanitize name for use as TypeScript identifier
   */
  static sanitizeIdentifier(name: string): string {
    // Remove invalid characters and ensure it starts with a letter or underscore
    return name
      .replace(/[^a-zA-Z0-9_$]/g, '')
      .replace(/^[0-9]/, '_$&');
  }

  /**
   * Get the common types file name
   */
  static getCommonTypesFileName(): string {
    return "common.types.ts";
  }
}