import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1366', width: 1366, height: 768 },
];

for (const viewport of viewports) {
  test(`login remains accessible without horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /selamat datang/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible();

    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(viewport.width + 1);
  });
}

test('login native controls support theme and password visibility toggles', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: /mode gelap/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  const password = page.getByLabel('Password', { exact: true });
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: /tampilkan password/i }).click();
  await expect(password).toHaveAttribute('type', 'text');
});

test('legacy page route redirects away from stale Blade UI', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: /selamat datang/i })).toBeVisible();
});
