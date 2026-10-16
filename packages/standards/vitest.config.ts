import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'cobertura'], include: ['src/**/*.ts'] },
  },
});
