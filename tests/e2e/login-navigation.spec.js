// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Login page', () => {
  test('shows login form at root', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('a:has-text("Connexion"), .btn:has-text("Connexion")')).toBeVisible();
  });

  test('login form has pre-filled credentials', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@admin.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('admin');
  });

  test('clicking Connexion navigates to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.locator('a:has-text("Connexion"), .btn-primary:has-text("Connexion")').first().click();
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('login page shows logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img[alt="..."], img[alt="Logo"]').first()).toBeVisible();
  });

  test('navigation and header are hidden on login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.v-navigation-drawer')).toHaveCount(0);
  });
});

test.describe('Navigation sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('shows navigation drawer on non-login pages', async ({ page }) => {
    await expect(page.locator('.v-navigation-drawer')).toBeVisible();
  });

  test('shows Eloyer brand title', async ({ page }) => {
    await expect(page.locator('.v-navigation-drawer')).toContainText('Eloyer');
    await expect(page.locator('.v-navigation-drawer')).toContainText('Legal Operations');
  });

  test('shows logo image', async ({ page }) => {
    await expect(page.locator('.v-navigation-drawer img').first()).toBeVisible();
  });

  test('shows role selector', async ({ page }) => {
    await expect(page.locator('.v-navigation-drawer .v-select')).toBeVisible();
  });

  test('dark mode toggle is visible', async ({ page }) => {
    await expect(page.locator('.v-navigation-drawer .v-input--switch')).toBeVisible();
  });

  test('dark mode toggle switches theme', async ({ page }) => {
    const toggle = page.locator('.v-navigation-drawer .v-input--switch input').first();
    const isDarkBefore = await page.evaluate(() =>
      document.documentElement.classList.contains('theme--dark')
    );
    await toggle.click({ force: true });
    await page.waitForTimeout(300);
    const isDarkAfter = await page.evaluate(() =>
      document.documentElement.classList.contains('theme--dark')
    );
    expect(isDarkAfter).not.toBe(isDarkBefore);
  });
});
