import alloyPlugin from '@alloy-js/rollup-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
    exclude: ['test/**/*.d.ts'],
    setupFiles: ['./test/vitest.setup.ts'],
  },
  esbuild: {
    jsx: 'preserve',
    sourcemap: 'both',
  },
  plugins: [alloyPlugin()],
});
