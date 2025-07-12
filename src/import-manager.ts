import { Type } from '@typespec/compiler';
import { NamingStrategy } from './naming.js';

/**
 * Import statement information
 */
export interface ImportInfo {
  namedImports: Set<string>;
  defaultImport?: string;
  filePath: string;
  isTypeOnly: boolean;
}

/**
 * Manages imports for generated TypeScript files
 */
export class ImportManager {
  private imports = new Map<string, ImportInfo>();
  private currentFile: string;

  constructor(currentFile: string) {
    this.currentFile = currentFile;
  }

  /**
   * Add a named import
   */
  addNamedImport(
    name: string,
    filePath: string,
    isTypeOnly: boolean = true,
  ): void {
    const key = `${filePath}:${isTypeOnly}`;

    if (!this.imports.has(key)) {
      this.imports.set(key, {
        namedImports: new Set(),
        filePath,
        isTypeOnly,
      });
    }

    this.imports.get(key)!.namedImports.add(name);
  }

  /**
   * Add a default import
   */
  addDefaultImport(
    name: string,
    filePath: string,
    isTypeOnly: boolean = false,
  ): void {
    const key = `${filePath}:${isTypeOnly}`;

    if (!this.imports.has(key)) {
      this.imports.set(key, {
        namedImports: new Set(),
        filePath,
        isTypeOnly,
      });
    }

    this.imports.get(key)!.defaultImport = name;
  }

  /**
   * Add import for a TypeSpec type
   */
  addTypeImport(type: Type): void {
    const interfaceName = NamingStrategy.getInterfaceName(type);
    const fileName = NamingStrategy.toInterfaceFileName(interfaceName);
    const relativePath = this.getRelativePath(fileName);

    this.addNamedImport(interfaceName, relativePath, true);
  }

  /**
   * Add import for common types
   */
  addCommonTypesImport(namedImports: string[]): void {
    const fileName = NamingStrategy.getCommonTypesFileName();
    const relativePath = this.getRelativePath(fileName);

    for (const importName of namedImports) {
      this.addNamedImport(importName, relativePath, true);
    }
  }

  /**
   * Get relative path from current file to target file
   */
  private getRelativePath(targetFile: string): string {
    // For flat structure, all files are in the same directory
    // So we just need the file name without extension, plus .js
    const fileName = targetFile.replace('.ts', '.js');
    return `./${fileName}`;
  }

  /**
   * Generate import statements
   */
  generateImports(): string[] {
    const statements: string[] = [];

    // Sort imports by file path for consistent output
    const sortedImports = Array.from(this.imports.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    for (const [, importInfo] of sortedImports) {
      const statement = this.generateImportStatement(importInfo);
      if (statement) {
        statements.push(statement);
      }
    }

    return statements;
  }

  /**
   * Generate a single import statement
   */
  private generateImportStatement(importInfo: ImportInfo): string | null {
    const parts: string[] = [];

    // Add default import
    if (importInfo.defaultImport) {
      parts.push(importInfo.defaultImport);
    }

    // Add named imports
    if (importInfo.namedImports.size > 0) {
      const namedImports = Array.from(importInfo.namedImports).sort();
      const namedImportsStr = `{ ${namedImports.join(', ')} }`;
      parts.push(namedImportsStr);
    }

    if (parts.length === 0) {
      return null;
    }

    const typeOnlyPrefix = importInfo.isTypeOnly ? 'type ' : '';
    const importsStr = parts.join(', ');

    return `import ${typeOnlyPrefix}${importsStr} from '${importInfo.filePath}';`;
  }

  /**
   * Reset imports for a new file
   */
  reset(currentFile: string): void {
    this.currentFile = currentFile;
    this.imports.clear();
  }

  /**
   * Check if a type needs to be imported
   */
  needsImport(type: Type): boolean {
    switch (type.kind) {
      case 'Model':
      case 'Union':
      case 'Enum':
        return Boolean(type.name);
      case 'Scalar':
        return Boolean(type.name) && !this.isBuiltInScalar(type.name);
      default:
        return false;
    }
  }

  /**
   * Check if a scalar is built-in (doesn't need import)
   */
  private isBuiltInScalar(name: string): boolean {
    const builtInScalars = new Set([
      'string',
      'number',
      'boolean',
      'int32',
      'int64',
      'float32',
      'float64',
      'bytes',
      'url',
      'uuid',
      'duration',
      'utcDateTime',
      'offsetDateTime',
      'plainDate',
      'plainTime',
    ]);

    return builtInScalars.has(name);
  }

  /**
   * Get all referenced types from a type
   */
  getReferencedTypes(type: Type): Type[] {
    const referencedTypes: Type[] = [];

    switch (type.kind) {
      case 'Model':
        // Add base model if it exists
        if (type.baseModel && this.needsImport(type.baseModel)) {
          referencedTypes.push(type.baseModel);
        }

        // Add property types
        for (const prop of type.properties.values()) {
          referencedTypes.push(...this.getReferencedTypes(prop.type));
        }

        // Add indexer types
        if (type.indexer) {
          referencedTypes.push(...this.getReferencedTypes(type.indexer.key));
          referencedTypes.push(...this.getReferencedTypes(type.indexer.value));
        }
        break;

      case 'Union':
        for (const variant of type.variants.values()) {
          referencedTypes.push(...this.getReferencedTypes(variant.type));
        }
        break;

      case 'Tuple':
        for (const element of type.values) {
          referencedTypes.push(...this.getReferencedTypes(element));
        }
        break;

      case 'Scalar':
        if (type.baseScalar && this.needsImport(type.baseScalar)) {
          referencedTypes.push(type.baseScalar);
        }
        break;
    }

    return referencedTypes.filter((t) => this.needsImport(t));
  }

  /**
   * Add imports for all referenced types
   */
  addImportsForType(type: Type): void {
    const referencedTypes = this.getReferencedTypes(type);

    for (const refType of referencedTypes) {
      this.addTypeImport(refType);
    }
  }
}
