import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Pryluky city center — mocked GPS for determinism.
    geolocation: { latitude: 50.5942, longitude: 32.3874 },
    permissions: ['geolocation'],
  },
  projects: [
    {
      name: 'pwa-mobile',
      use: {
        ...devices['Pixel 7'],
        geolocation: { latitude: 50.5942, longitude: 32.3874 },
        permissions: ['geolocation'],
      },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
