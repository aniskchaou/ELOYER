// @ts-check
const { test, expect } = require('@playwright/test');

// Helper: navigate to the workspace for case ID 1 (or first available)
async function goToWorkspace(page, caseId = 1) {
  await page.goto(`/lawyer/cases/${caseId}`);
  await page.waitForTimeout(1500);
}

// Tab names as rendered by the component
const TABS = [
  'Documents',
  'Time & Tasks',
  'Court & Hearings',
  'Client Communication',
  'Billing',
  'Research',
  'Performance',
];

test.describe('Lawyer Case Workspace — page load', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
  });

  test('renders workspace title', async ({ page }) => {
    await expect(page.locator('h1, .text-h5').first()).toContainText('Lawyer Daily Workspace');
  });

  test('shows Back to Portal button', async ({ page }) => {
    await expect(page.locator('button:has-text("Back to Portal")')).toBeVisible();
  });

  test('Back to Portal returns to /lawyer/portal', async ({ page }) => {
    await page.locator('button:has-text("Back to Portal")').click();
    await expect(page).toHaveURL(/\/lawyer\/portal/);
  });

  test('shows Refresh button', async ({ page }) => {
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
  });

  test('renders all tabs', async ({ page }) => {
    for (const tab of TABS) {
      await expect(page.locator(`.v-tab:has-text("${tab}")`)).toBeVisible();
    }
  });
});

test.describe('Lawyer Case Workspace — Documents tab', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
    await page.locator('.v-tab:has-text("Documents")').click();
    await page.waitForTimeout(500);
  });

  test('shows Create Document From Template card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Create Document From Template")')).toBeVisible();
  });

  test('shows Edit Contract card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Edit Contract")')).toBeVisible();
  });

  test('shows Upload External Document card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Upload External Document")')).toBeVisible();
  });

  test('shows Compare Versions card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Compare Versions")')).toBeVisible();
  });

  test('shows E-Sign & AI Summarize card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("E-Sign")')).toBeVisible();
  });

  test('can fill external document title and URL', async ({ page }) => {
    const card = page.locator('.v-card:has(.v-card__title:has-text("Upload External Document"))');
    await card.locator('input').nth(0).fill('Playwright Doc');
    await card.locator('input').nth(1).fill('https://example.com/doc.pdf');
    await expect(card.locator('input').nth(0)).toHaveValue('Playwright Doc');
  });

  test('Upload button is visible', async ({ page }) => {
    await expect(page.locator('.v-card:has(.v-card__title:has-text("Upload External Document")) button:has-text("Upload")')).toBeVisible();
  });

  test('E-Sign button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Send for E-signature")')).toBeVisible();
  });

  test('AI Summarize button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("AI Summarize")')).toBeVisible();
  });

  test('clicking AI Summarize does not crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.locator('button:has-text("AI Summarize")').click();
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('Compare Versions button is visible', async ({ page }) => {
    await expect(page.locator('.v-card:has(.v-card__title:has-text("Compare Versions")) button:has-text("Compare")')).toBeVisible();
  });
});

test.describe('Lawyer Case Workspace — Time & Tasks tab', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
    await page.locator('.v-tab:has-text("Time & Tasks")').click();
    await page.waitForTimeout(500);
  });

  test('shows Log Billable Hours card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Log Billable Hours")')).toBeVisible();
  });

  test('shows Start / Stop Timer card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Start / Stop Timer")')).toBeVisible();
  });

  test('shows Assign Tasks card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Assign Tasks")')).toBeVisible();
  });

  test('can fill hours input', async ({ page }) => {
    const hoursInput = page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) input[type="number"]').first();
    await hoursInput.fill('2.5');
    await expect(hoursInput).toHaveValue('2.5');
  });

  test('Log Time button is visible', async ({ page }) => {
    await expect(page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) button:has-text("Log Time")')).toBeVisible();
  });

  test('Start timer button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Start")')).toBeVisible();
  });

  test('Stop timer button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Stop")')).toBeVisible();
  });

  test('can fill task title', async ({ page }) => {
    const titleInput = page.locator('.v-card:has(.v-card__title:has-text("Assign Tasks")) input[type="text"]').first();
    await titleInput.fill('Review contract');
    await expect(titleInput).toHaveValue('Review contract');
  });

  test('Add Task button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Task")')).toBeVisible();
  });

  test('clicking Log Time does not crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) input[type="number"]').first().fill('1');
    await page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) button:has-text("Log Time")').click();
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});

test.describe('Lawyer Case Workspace — Court & Hearings tab', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
    await page.locator('.v-tab:has-text("Court & Hearings")').click();
    await page.waitForTimeout(500);
  });

  test('shows Add Hearing card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Add Hearing")')).toBeVisible();
  });

  test('shows Upload Court Document card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Upload Court Document")')).toBeVisible();
  });

  test('shows Auto Sync Calendar card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Auto Sync Calendar")')).toBeVisible();
  });

  test('shows Deadline Alerts card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Deadline Alerts")')).toBeVisible();
  });

  test('Add Hearing button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Hearing")')).toBeVisible();
  });

  test('can fill court name', async ({ page }) => {
    const courtInput = page.locator('.v-card:has(.v-card__title:has-text("Add Hearing")) input[type="text"]').first();
    await courtInput.fill('Supreme Court');
    await expect(courtInput).toHaveValue('Supreme Court');
  });

  test('Refresh Alerts button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Refresh Alerts")')).toBeVisible();
  });

  test('clicking Refresh Alerts does not crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.locator('button:has-text("Refresh Alerts")').click();
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('Upload Court Doc button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Upload Court Doc")')).toBeVisible();
  });

  test('Track Decision button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Track Decision")')).toBeVisible();
  });
});

test.describe('Lawyer Case Workspace — Client Communication tab', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
    await page.locator('.v-tab:has-text("Client Communication")').click();
    await page.waitForTimeout(500);
  });

  test('shows Send Messages card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Send Messages")')).toBeVisible();
  });

  test('shows Request Documents card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Request Documents")')).toBeVisible();
  });

  test('shows Conversation History card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Conversation History")')).toBeVisible();
  });

  test('Send Message button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Send Message")')).toBeVisible();
  });

  test('Share Case Update button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Share Case Update")')).toBeVisible();
  });

  test('can type a message subject and body', async ({ page }) => {
    const card = page.locator('.v-card:has(.v-card__title:has-text("Send Messages"))');
    const inputs = card.locator('input[type="text"]');
    await inputs.nth(0).fill('Test subject');
    await expect(inputs.nth(0)).toHaveValue('Test subject');
    const msgBody = card.locator('textarea').first();
    await msgBody.fill('Hello client, this is a test message.');
    await expect(msgBody).toHaveValue('Hello client, this is a test message.');
  });

  test('Request Documents button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Request Documents")')).toBeVisible();
  });

  test('Schedule Meeting button is visible', async ({ page }) => {
    await expect(page.locator('.v-card:has(.v-card__title:has-text("Request Documents")) button:has-text("Schedule Meeting")')).toBeVisible();
  });
});

test.describe('Lawyer Case Workspace — Billing tab', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
    await page.locator('.v-tab:has-text("Billing")').click();
    await page.waitForTimeout(500);
  });

  test('shows Convert Time Logs to Invoice card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Convert Time Logs to Invoice")')).toBeVisible();
  });

  test('shows Manage Retainer card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Manage Retainer")')).toBeVisible();
  });

  test('shows Invoices & Payments card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Invoices & Payments")')).toBeVisible();
  });

  test('Create Invoice button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Create Invoice")')).toBeVisible();
  });

  test('Add Retainer button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Add Retainer")')).toBeVisible();
  });

  test('can fill hourly rate', async ({ page }) => {
    const rateInput = page.locator('.v-card:has(.v-card__title:has-text("Convert Time Logs")) input[type="number"]').first();
    await rateInput.fill('150');
    await expect(rateInput).toHaveValue('150');
  });

  test('clicking Create Invoice does not crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.locator('button:has-text("Create Invoice")').click();
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});

test.describe('Lawyer Case Workspace — Research tab', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
    await page.locator('.v-tab:has-text("Research")').click();
    await page.waitForTimeout(500);
  });

  test('shows Search Case Law card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Search Case Law")')).toBeVisible();
  });

  test('shows Premium Research AI card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Premium Research AI")')).toBeVisible();
  });

  test('shows Attached Research card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Attached Research")')).toBeVisible();
  });

  test('Search button is visible', async ({ page }) => {
    await expect(page.locator('.v-card:has(.v-card__title:has-text("Search Case Law")) button:has-text("Search")')).toBeVisible();
  });

  test('can type search terms', async ({ page }) => {
    const searchInput = page.locator('.v-card:has(.v-card__title:has-text("Search Case Law")) input[type="text"]').first();
    await searchInput.fill('breach of contract');
    await expect(searchInput).toHaveValue('breach of contract');
  });

  test('clicking Search does not crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.locator('.v-card:has(.v-card__title:has-text("Search Case Law")) input[type="text"]').first().fill('negligence');
    await page.locator('.v-card:has(.v-card__title:has-text("Search Case Law")) button:has-text("Search")').click();
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('Suggest Laws button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Suggest Laws")')).toBeVisible();
  });

  test('clicking Suggest Laws does not crash', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.locator('button:has-text("Suggest Laws")').click();
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});

test.describe('Lawyer Case Workspace — Performance tab', () => {
  test.beforeEach(async ({ page }) => {
    await goToWorkspace(page);
    await page.locator('.v-tab:has-text("Performance")').click();
    await page.waitForTimeout(500);
  });

  test('shows Performance Analytics card', async ({ page }) => {
    await expect(page.locator('.v-card__title:has-text("Performance Analytics")')).toBeVisible();
  });

  test('Win Rate is shown', async ({ page }) => {
    await expect(page.locator('text=/Win Rate/i')).toBeVisible();
  });
});

test.describe('Lawyer Case Workspace — all tabs accessible', () => {
  test('can switch through all tabs without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await goToWorkspace(page);

    for (const tab of TABS) {
      const tabEl = page.locator(`.v-tab:has-text("${tab}")`);
      if (await tabEl.isVisible()) {
        await tabEl.click();
        await page.waitForTimeout(400);
      }
    }
    expect(errors).toHaveLength(0);
  });
});
