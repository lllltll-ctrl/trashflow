import { expect, test } from '@playwright/test';
import path from 'node:path';

test.describe('Classify flow', () => {
  test('uploads a photo and shows a category with confidence + CTA', async ({ page }) => {
    await page.goto('/classify');

    await expect(page.getByRole('heading', { name: /Що це за відходи/i })).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures/trash.png'));

    // Result card has one of the 5 categories in UA.
    const categories = /(Пластик|Папір і картон|Скло|Метал|Небезпечні відходи)/;
    await expect(page.getByText(categories).first()).toBeVisible({ timeout: 20_000 });

    // Confidence percentage rendered.
    await expect(page.getByText(/Впевненість: \d+%/)).toBeVisible();

    // Navigation to points filter works.
    await page.getByRole('link', { name: /Знайти найближчу точку/i }).click();
    await expect(page).toHaveURL(/\/points\?category=/);
  });
});
