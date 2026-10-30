import { defineConfig } from '@playwright/test';

/**
 * Used by `npm run report:merge` (and the CI "report" job) to combine the blob reports produced by
 * each browser/API job into one HTML report plus a combined JUnit file.
 */
export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: './reports/html', open: 'never', title: 'WebTestPro - automationexercise.com' }],
    ['junit', { outputFile: './reports/junit/merged-results.xml', includeProjectInTestName: true }],
  ],
});
