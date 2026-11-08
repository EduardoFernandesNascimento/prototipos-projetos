// @ts-check
// Testes e2e do protótipo Rango: abrem src/index.html por file:// (sem servidor).
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  timeout: 30000,
  // resultados dentro da pasta de testes (escopo do frontend), fora do git pelo .gitignore do projeto quando houver
  outputDir: './tests/e2e/.resultados',
  use: {
    ...devices['Desktop Chrome'],
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
