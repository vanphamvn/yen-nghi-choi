import { defineConfig, devices } from '@playwright/test';

const origin = `http://127.0.0.1:${process.env.LAB_UX_PORT || 4189}`;

export default defineConfig({
  testDir: './tests',
  testMatch: ['yen-lab-ux.spec.mjs', 'yen-lab-route.spec.mjs', 'yen-lab-game-kit.spec.mjs', 'yen-lab-privacy.spec.mjs', 'yen-lab-tho.spec.mjs', 'yen-lab-cang.spec.mjs', 'yen-lab-ba-dieu.spec.mjs', 'yen-lab-tham-tu.spec.mjs', 'yen-lab-book.spec.mjs', 'yen-lab-beta3.spec.mjs', 'homepage-mascot.spec.mjs'],
  outputDir: 'test-results/lab-ux',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/lab-ux', open: 'never' }]],
  use: {
    baseURL: origin,
    trace: 'retain-on-failure',
    launchOptions: process.env.LAB_UX_CHROMIUM_PATH ? { executablePath: process.env.LAB_UX_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'emulated-touch', use: { browserName: 'chromium', viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true } },
    // Local only (CI installs Chromium alone): LAB_UX_WEBKIT=1 adds WebKit for the homepage mascot regression.
    ...(process.env.LAB_UX_WEBKIT ? [{ name: 'webkit', testMatch: 'homepage-mascot.spec.mjs', use: { browserName: 'webkit' } }] : []),
    // Local only, release gates (#134): LAB_UX_DEVICES=1 runs the game journey on emulated phones.
    // WebKit is iPhone Safari's engine; this is emulation, not a physical device.
    ...(process.env.LAB_UX_DEVICES ? [
      { name: 'iphone-webkit', testMatch: ['yen-lab-tho.spec.mjs', 'yen-lab-cang.spec.mjs', 'yen-lab-ba-dieu.spec.mjs', 'yen-lab-tham-tu.spec.mjs', 'yen-lab-route.spec.mjs', 'yen-lab-privacy.spec.mjs', 'yen-lab-beta3.spec.mjs'], use: { ...devices['iPhone 15'] } },
      { name: 'android-chromium', testMatch: ['yen-lab-tho.spec.mjs', 'yen-lab-cang.spec.mjs', 'yen-lab-ba-dieu.spec.mjs', 'yen-lab-tham-tu.spec.mjs', 'yen-lab-route.spec.mjs', 'yen-lab-privacy.spec.mjs', 'yen-lab-beta3.spec.mjs'], use: { ...devices['Pixel 7'] } },
    ] : []),
  ],
  webServer: { command: 'node tools/serve-lab-ux.mjs', url: origin + '/docs/yen-lab/wireframes.html', reuseExistingServer: !process.env.CI },
});
