import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 60000,
  },
  expect: { timeout: 15000 },
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3100',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    trace: 'retain-on-failure',
  },
  reporter: 'list',
});
