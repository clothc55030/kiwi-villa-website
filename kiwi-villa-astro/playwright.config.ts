import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 測試配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* 執行測試的最大時間 */
  timeout: 30 * 1000,
  /* 測試失敗時重試次數 */
  retries: process.env.CI ? 2 : 0,
  /* 並行執行的 worker 數量 */
  workers: process.env.CI ? 1 : undefined,
  /* 報告器配置 */
  reporter: 'html',
  /* 共享設定 */
  use: {
    /* 基礎 URL */
    baseURL: 'http://localhost:4322',
    /* 收集追蹤資訊 */
    trace: 'on-first-retry',
    /* 截圖設定 */
    screenshot: 'only-on-failure',
    /* 影片錄製 */
    video: 'retain-on-failure',
  },

  /* 配置不同的瀏覽器 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 測試行動裝置 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 在測試前啟動開發伺服器 */
  webServer: {
    command: 'npm run dev',
    port: 4322,
    reuseExistingServer: !process.env.CI,
  },
});