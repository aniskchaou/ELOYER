// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = '/lawyer/portal';

test.describe('Lawyer Portal — page load', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1, .text-h5')).toContainText('Lawyer Portal');
  });

  test('shows Refresh button', async ({ page }) => {
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
  });

  test('shows Start the Day card', async ({ page }) => {
    await expect(page.locator('.v-card-title:has-text("Start the Day"), .v-card__title:has-text("Start the Day")')).toBeVisible();
  });

  test('shows Quick Actions card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Quick Actions"), .v-card-title:has-text("Quick Actions")')).toBeVisible();
  });

  test('shows Create New Case form', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Create New Case"), .v-card-title:has-text("Create New Case")')).toBeVisible();
  });

  test('shows Your Cases table', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Your Cases"), .v-card-title:has-text("Your Cases")')).toBeVisible();
  });

  test('shows Pending Invoices card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Pending Invoices")')).toBeVisible();
  });

  test('shows Real Daily Workflow card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Real Daily Workflow")')).toBeVisible();
  });
});

test.describe('Lawyer Portal — Refresh action', () => {
  test('Refresh button triggers data reload without errors', async ({ page }) => {
    await page.goto(BASE);
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.locator('button:has-text("Refresh")').click();
    await page.waitForTimeout(1500);
    // No JS errors expected from clicking Refresh
    const fatalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('net::ERR'));
    expect(fatalErrors).toHaveLength(0);
  });
});

test.describe('Lawyer Portal — Quick Actions dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500); // allow API to load
  });

  test('Add Note dialog opens and closes', async ({ page }) => {
    const addNoteBtn = page.locator('button:has-text("Add Note")').first();
    // Button may be disabled if no case selected — try to select first case
    const caseSelect = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first();
    const input = caseSelect.locator('input').first();
    await input.click({ force: true });
    await page.waitForTimeout(500);
    const firstOption = page.locator('.v-list-item').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(300);
    }
    await addNoteBtn.click({ force: true });
    await expect(page.locator('.v-dialog:visible .v-card__title:has-text("Add Note")')).toBeVisible();
    await page.locator('.v-dialog:visible button:has-text("Cancel")').click();
    await expect(page.locator('.v-dialog:visible')).toHaveCount(0);
  });

  test('Log Time dialog opens and closes', async ({ page }) => {
    const caseSelect = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first();
    await caseSelect.locator('input').click({ force: true });
    await page.waitForTimeout(400);
    const firstOption = page.locator('.v-list-item').first();
    if (await firstOption.isVisible()) await firstOption.click();
    await page.waitForTimeout(300);

    await page.locator('button:has-text("Log Time")').first().click({ force: true });
    await expect(page.locator('.v-dialog:visible .v-card__title:has-text("Log Time")')).toBeVisible();
    await page.locator('.v-dialog:visible button:has-text("Cancel")').click();
    await expect(page.locator('.v-dialog:visible')).toHaveCount(0);
  });

  test('Schedule Meeting dialog opens and closes', async ({ page }) => {
    const caseSelect = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first();
    await caseSelect.locator('input').click({ force: true });
    await page.waitForTimeout(400);
    const firstOption = page.locator('.v-list-item').first();
    if (await firstOption.isVisible()) await firstOption.click();
    await page.waitForTimeout(300);

    await page.locator('button:has-text("Schedule Meeting")').first().click({ force: true });
    await expect(page.locator('.v-dialog:visible .v-card__title:has-text("Schedule Meeting")')).toBeVisible();
    await page.locator('.v-dialog:visible button:has-text("Cancel")').click();
    await expect(page.locator('.v-dialog:visible')).toHaveCount(0);
  });
});

test.describe('Lawyer Portal — Create New Case form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1000);
  });

  test('can type in case title field', async ({ page }) => {
    const titleField = page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) input[type="text"]').first();
    await titleField.fill('Test Case from Playwright');
    await expect(titleField).toHaveValue('Test Case from Playwright');
  });

  test('can type in case description', async ({ page }) => {
    const descField = page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) textarea').first();
    await descField.fill('Playwright test description');
    await expect(descField).toHaveValue('Playwright test description');
  });

  test('Create Case button is visible', async ({ page }) => {
    await expect(page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) button:has-text("Create Case")')).toBeVisible();
  });

  test('submitting empty title shows no crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) button:has-text("Create Case")').click();
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});

test.describe('Lawyer Portal — Open Case navigation', () => {
  test('Open Case button in Quick Actions navigates to workspace', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    const openCaseBtn = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) button:has-text("Open Case")').first();
    // Only click if a case is selected (button not disabled)
    const isDisabled = await openCaseBtn.getAttribute('disabled');
    if (isDisabled === null) {
      await openCaseBtn.click();
      await expect(page).toHaveURL(/\/lawyer\/cases\//);
    } else {
      test.info().annotations.push({ type: 'info', description: 'No case available to open' });
    }
  });

  test('"Open Case" button in Priority Cases list works', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    const openBtn = page.locator('.v-card:has(.v-card__title:has-text("Start the Day")) button:has-text("Open Case")').first();
    if (await openBtn.isVisible()) {
      await openBtn.click();
      await expect(page).toHaveURL(/\/lawyer\/cases\//);
    }
  });
});
