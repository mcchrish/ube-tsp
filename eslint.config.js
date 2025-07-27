import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tsEslint.config([
  globalIgnores([
    "dist/**",
    "tsp-output/**",
    "test-specs/output/**",
    "example",
  ]),
  eslint.configs.recommended,
  tsEslint.configs.recommended,
]);
