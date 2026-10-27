import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '../..');
const apiEnvironment = {
  NODE_ENV: 'test',
  API_PORT: '3100',
  API_CORS_ORIGIN: 'http://localhost:4173',
  LOG_LEVEL: 'error',
  CONTENT_CACHE_MAX_AGE_SECONDS: '300',
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{platform}{ext}',
  reporter: process.env.CI ? [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'line',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @nuagehub/api build && node apps/api/dist/main.js',
      cwd: repositoryRoot,
      env: apiEnvironment,
      url: 'http://127.0.0.1:3100/api/v1/health',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'pnpm --filter @nuagehub/web build && pnpm --filter @nuagehub/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
      cwd: repositoryRoot,
      env: { VITE_API_BASE_URL: 'http://localhost:3100' },
      url: 'http://localhost:4173',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'visual',
      testMatch: /visual\.e2e\.test\.ts/,
    },
    {
      name: 'e2e',
      testMatch: /app\.e2e\.test\.ts/,
    },
  ],
});
