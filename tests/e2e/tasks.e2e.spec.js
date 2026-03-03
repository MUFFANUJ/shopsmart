const { test, expect } = require('@playwright/test');

test('user can create and verify a task from the UI', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Title').first().fill('Ship production release');
  await page.getByLabel('Description').first().fill('Complete final QA and deploy safely.');
  await page.getByRole('button', { name: 'Create Task' }).first().click();

  await expect(page.getByText('Ship production release')).toBeVisible();
  await expect(page.getByText('Complete final QA and deploy safely.')).toBeVisible();
});
