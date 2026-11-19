// LAB-F09 (#133): Yên Lab smoke. Local: node fixture server. Deployed: LAB_BASE_URL=https://… [LAB_EXPECT_SHA=<sha>].
// No API keys. Screenshots, video and trace are kept for failures.
import { defineConfig } from '@playwright/test';

const local = !process.env.LAB_BASE_URL;
export default defineConfig({
  testDir: './tests',
  testMatch: 'yen-lab-smoke.spec.mjs',
  outputDir: 'test-results/lab-smoke/artifacts',
  timeout: 45_000,
  retries: 0, // a release record must not hide a flaky pass; re-run the workflow instead
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/lab-smoke', open: 'never' }], ['json', { outputFile: 'test-results/lab-smoke/results.json' }]],
  use: {
    screenshot: 'only-on-failure', video: 'retain-on-failure', trace: 'retain-on-failure',
    launchOptions: process.env.LAB_UX_CHROMIUM_PATH ? { executablePath: process.env.LAB_UX_CHROMIUM_PATH } : {},
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: local ? { command: 'node tools/serve-lab-ux.mjs', url: 'http://127.0.0.1:4189/lab/', reuseExistingServer: !process.env.CI } : undefined,
});
