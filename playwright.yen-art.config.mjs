import { defineConfig } from "@playwright/test";

const external = process.env.YEN_ART_BASE_URL;
const port = 4195;
export default defineConfig({
  testDir: "./tests",
  testMatch: "yen-art-reference.spec.mjs",
  timeout: 45_000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/yen-art", open: "never" }]],
  use: {
    baseURL: external || "http://127.0.0.1:" + port,
    browserName: "chromium",
    launchOptions: process.env.LAB_UX_CHROMIUM_PATH ? { executablePath: process.env.LAB_UX_CHROMIUM_PATH } : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  webServer: external ? undefined : {
    command: "python3 -m http.server " + port + " --bind 127.0.0.1",
    url: "http://127.0.0.1:" + port + "/tinh-huong/art-reference/",
    reuseExistingServer: !process.env.CI
  }
});