import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'yen-lab-ux.spec.mjs',
  outputDir: 'test-results/lab-ux',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/lab-ux', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4189',
    trace: 'retain-on-failure',
    launchOptions: process.env.LAB_UX_CHROMIUM_PATH ? { executablePath: process.env.LAB_UX_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'emulated-touch', use: { browserName: 'chromium', viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true } },
  ],
  webServer: { command: 'node tools/serve-lab-ux.mjs', url: 'http://127.0.0.1:4189/docs/yen-lab/wireframes.html', reuseExistingServer: !process.env.CI },
});
