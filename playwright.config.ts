import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  expect: {
    timeout: 10_000,
  },
  // NOTE: Tests run fully parallel across two projects (chromium + mobile-chrome)
  // against a single shared Neon branch seeded once in globalSetup. There is no
  // per-worker DB isolation. This works for this take-home because mutating tests
  // (pay, decline, cancel) create their own requests and read-only tests use loose
  // assertions. In production, we'd isolate a DB branch per worker or serialize
  // mutating specs to eliminate shared-state flakiness.
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  globalSetup: "./tests/e2e/global.setup.ts",
  globalTeardown: "./tests/e2e/global.teardown.ts",
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    actionTimeout: 10_000,
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    testIdAttribute: "data-testid",
    video: "on",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // Next.js loads .env.local (written by globalSetup) which overrides
        // .env with the temporary branch DATABASE_URL.
      },
});
