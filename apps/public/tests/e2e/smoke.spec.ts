import { test, expect } from '@playwright/test';

// Smoke tests — verify critical pages render without JS errors.
// Auth is localStorage-based, so we inject the session cookie directly.

test.beforeEach(async ({ page }) => {
  // Simulate one-click login (sets localStorage key used by AuthProvider)
  await page.addInitScript(() => {
    localStorage.setItem('tf_resident_session', '1');
  });
});

test('home page loads with TrashFlow brand', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('TrashFlow')).toBeVisible();
  // Community badge
  await expect(page.getByText(/Прилуки/i)).toBeVisible();
});

test('home page shows tiles for authenticated user', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Інтерактив')).toBeVisible();
  await expect(page.getByText('Точки')).toBeVisible();
  await expect(page.getByText('Графік')).toBeVisible();
  await expect(page.getByText('Правила')).toBeVisible();
});

test('home page shows barakhоlka and report banners when logged in', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Барахолка громади')).toBeVisible();
  await expect(page.getByText('Побачили звалище?')).toBeVisible();
});

test('/classify shows interactive view', async ({ page }) => {
  await page.goto('/classify');
  await expect(page.getByText('Навчання та ігри')).toBeVisible();
  await expect(page.getByText('Навчись сортувати')).toBeVisible();
  await expect(page.getByText('Почати гру')).toBeVisible();
});

test('/classify game starts when clicking Почати гру', async ({ page }) => {
  await page.goto('/classify');
  await page.getByText('Почати гру').click();
  // Game mode shows the bins
  await expect(page.getByText('СКЛО')).toBeVisible();
  await expect(page.getByText('ПЛАСТИК')).toBeVisible();
  await expect(page.getByText('ПАПІР')).toBeVisible();
});

test('/points page loads', async ({ page }) => {
  await page.goto('/points');
  await expect(page.getByText('Точки прийому')).toBeVisible();
});

test('/report page loads with type selector', async ({ page }) => {
  await page.goto('/report');
  // Report form should show type selector
  await expect(page.getByText(/звалище|бак|скарга/i)).toBeVisible();
});

test('/support page shows form when logged in', async ({ page }) => {
  await page.goto('/support');
  await expect(page.getByText('Написати нам')).toBeVisible();
  await expect(page.getByPlaceholder(/email/i)).toBeVisible();
});

test('guest sees auth modal when clicking barakhоlka', async ({ page }) => {
  // Remove session to simulate guest
  await page.addInitScript(() => {
    localStorage.removeItem('tf_resident_session');
  });
  await page.goto('/');
  // Click the barakhоlka link
  await page.getByText('Барахолка громади').click();
  // Auth modal should appear
  await expect(page.getByText('Увійти в акаунт')).toBeVisible();
});
