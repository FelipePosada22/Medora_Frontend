import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import path from 'path';

// Load the correct .env.e2e.<env> file based on E2E_ENV (default: 'local')
const e2eEnv = process.env['E2E_ENV'] ?? 'local';
loadEnv({ path: path.resolve(__dirname, `.env.e2e.${e2eEnv}`), override: true });

const baseURL  = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';
const useMocks = process.env['E2E_USE_MOCKS'] !== 'false'; // true by default

// Only spin up the dev server when running locally (not against a remote env)
const webServer = useMocks || baseURL.startsWith('http://localhost')
  ? {
      command: 'npm run start',
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
    }
  : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never', outputFolder: `playwright-report-${e2eEnv}` }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer,
});
