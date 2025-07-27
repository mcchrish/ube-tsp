import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tsEslint.config([
  globalIgnores(["dist/**"]),
  eslint.configs.recommended,
  tsEslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
]);
