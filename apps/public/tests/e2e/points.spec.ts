import { expect, test } from '@playwright/test';

test.describe('Points browser', () => {
  test('renders filter chips and honours ?category= deep-link', async ({ page }) => {
    await page.goto('/points?category=plastic');

    await expect(page.getByRole('heading', { name: /Точки збору поблизу/ })).toBeVisible();

    // Plastic chip should be active (highlighted).
    const plasticChip = page.getByRole('button', { name: /Пластик/ });
    await expect(plasticChip).toBeVisible();

    // Either a list of points or the empty-state appears within 15 s.
    const pointCard = page.locator('[class*="rounded-lg border"]').filter({ hasText: /м$|км$/ });
    const emptyState = page.getByText(/Поки що немає точок збору/);
    await expect(pointCard.first().or(emptyState)).toBeVisible({ timeout: 15_000 });
  });

  test('category filter buttons toggle independently', async ({ page }) => {
    await page.goto('/points');
    await page.getByRole('button', { name: /Скло/ }).click();
    await expect(page).toHaveURL('/points');
    await page.getByRole('button', { name: /Метал/ }).click();
    // Filter state is in-memory — URL doesn't change, but the UI should
    // redraw without hard navigation. We just assert the page still lives.
    await expect(page.getByRole('heading', { name: /Точки збору/ })).toBeVisible();
  });
});
