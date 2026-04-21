import { expect, test } from '@playwright/test';
import path from 'node:path';

test.describe('Report flow', () => {
  test('renders the form and blocks submission without a photo', async ({ page }) => {
    await page.goto('/report');
    await expect(page.getByRole('heading', { name: /Повідомити про звалище/i })).toBeVisible();

    const submit = page.getByRole('button', { name: /^Надіслати скаргу$/ });
    await expect(submit).toBeDisabled();
  });

  test('uploads a photo, optional category toggles, and enables submit', async ({ page }) => {
    await page.goto('/report');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures/trash.png'));

    // Preview shows up, category chips render.
    await expect(page.getByAltText('Фото звалища')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Небезпечні відходи/ }).click();

    await expect(page.getByRole('button', { name: /^Надіслати скаргу$/ })).toBeEnabled();
  });
});
