import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('renders three resident action cards linking to each flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Громада чистішої Прилуки/i })).toBeVisible();

    await expect(page.getByRole('link', { name: /Класифікувати сміття/ })).toHaveAttribute(
      'href',
      '/classify',
    );
    await expect(page.getByRole('link', { name: /Повідомити про звалище/ })).toHaveAttribute(
      'href',
      '/report',
    );
    await expect(page.getByRole('link', { name: /Мапа точок збору/ })).toHaveAttribute(
      'href',
      '/points',
    );
  });

  test('ships a PWA manifest with Ukrainian name', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBe('TrashFlow');
    expect(manifest.lang).toBe('uk');
  });
});
