import alloyPlugin from "@alloy-js/rollup-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["tests/**/*.d.ts"],
    setupFiles: ["./tests/vitest.setup.ts"],
  },
  esbuild: {
    jsx: "preserve",
    sourcemap: "both",
  },
  plugins: [alloyPlugin()],
});
