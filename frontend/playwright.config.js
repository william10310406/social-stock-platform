// Playwright 端到端測試配置
const { defineConfig, devices } = require('@playwright/test');
const { createPlaywrightConfig } = require('./config/index.js');

const baseConfig = createPlaywrightConfig();

module.exports = defineConfig({
  ...baseConfig,
  projects: [
    ...baseConfig.browserConfigs.browsers.map((browser) => ({
      name: browser,
      use: { ...devices[`Desktop ${browser.charAt(0).toUpperCase() + browser.slice(1)}`] },
    })),
    ...baseConfig.browserConfigs.mobile.map((device) => ({
      name: `Mobile ${device}`,
      use: { ...devices[device] },
    })),
  ],
});
