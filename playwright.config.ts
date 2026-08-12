import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // A `.only` left in a test silently shrinks the suite, so CI refuses to run one.
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'] } },
    // The OS metaphor changes shape entirely below the breakpoint, so mobile is not an
    // afterthought project — it exercises a different component tree.
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
    // Touch injection for the swipe-to-dismiss gesture goes through CDP, which only Chromium
    // speaks — so the sheet needs a Chromium-flavoured phone as well as a WebKit one.
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // CI downloads `.next` from the build job, so rebuilding here would burn several
        // minutes reproducing an artifact it already has. Locally there is no artifact.
        command: process.env.CI ? 'pnpm start' : 'pnpm build && pnpm start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
