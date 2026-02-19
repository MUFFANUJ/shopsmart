const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  webServer: {
    command: 'node src/index.js',
    port: 5001,
    reuseExistingServer: false,
    timeout: 30_000
  },
  use: {
    baseURL: 'http://localhost:5001'
  }
});
