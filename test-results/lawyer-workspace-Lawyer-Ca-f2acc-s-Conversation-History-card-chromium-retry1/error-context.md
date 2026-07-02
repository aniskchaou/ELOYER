# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lawyer-workspace.spec.js >> Lawyer Case Workspace — Client Communication tab >> shows Conversation History card
- Location: tests\e2e\lawyer-workspace.spec.js:235:3

# Error details

```
Error: locator.click: Page crashed
Call log:
  - waiting for locator('.v-tab:has-text("Client Communication")')

```

# Test source

```ts
  123 | 
  124 |   test('shows Assign Tasks card', async ({ page }) => {
  125 |     await expect(page.locator('.v-card__title:has-text("Assign Tasks")')).toBeVisible();
  126 |   });
  127 | 
  128 |   test('can fill hours input', async ({ page }) => {
  129 |     const hoursInput = page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) input[type="number"]').first();
  130 |     await hoursInput.fill('2.5');
  131 |     await expect(hoursInput).toHaveValue('2.5');
  132 |   });
  133 | 
  134 |   test('Log Time button is visible', async ({ page }) => {
  135 |     await expect(page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) button:has-text("Log Time")')).toBeVisible();
  136 |   });
  137 | 
  138 |   test('Start timer button is visible', async ({ page }) => {
  139 |     await expect(page.locator('button:has-text("Start")')).toBeVisible();
  140 |   });
  141 | 
  142 |   test('Stop timer button is visible', async ({ page }) => {
  143 |     await expect(page.locator('button:has-text("Stop")')).toBeVisible();
  144 |   });
  145 | 
  146 |   test('can fill task title', async ({ page }) => {
  147 |     const titleInput = page.locator('.v-card:has(.v-card__title:has-text("Assign Tasks")) input[type="text"]').first();
  148 |     await titleInput.fill('Review contract');
  149 |     await expect(titleInput).toHaveValue('Review contract');
  150 |   });
  151 | 
  152 |   test('Add Task button is visible', async ({ page }) => {
  153 |     await expect(page.locator('button:has-text("Add Task")')).toBeVisible();
  154 |   });
  155 | 
  156 |   test('clicking Log Time does not crash', async ({ page }) => {
  157 |     const errors = [];
  158 |     page.on('pageerror', err => errors.push(err.message));
  159 |     await page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) input[type="number"]').first().fill('1');
  160 |     await page.locator('.v-card:has(.v-card__title:has-text("Log Billable Hours")) button:has-text("Log Time")').click();
  161 |     await page.waitForTimeout(1000);
  162 |     expect(errors).toHaveLength(0);
  163 |   });
  164 | });
  165 | 
  166 | test.describe('Lawyer Case Workspace — Court & Hearings tab', () => {
  167 |   test.beforeEach(async ({ page }) => {
  168 |     await goToWorkspace(page);
  169 |     await page.locator('.v-tab:has-text("Court & Hearings")').click();
  170 |     await page.waitForTimeout(500);
  171 |   });
  172 | 
  173 |   test('shows Add Hearing card', async ({ page }) => {
  174 |     await expect(page.locator('.v-card__title:has-text("Add Hearing")')).toBeVisible();
  175 |   });
  176 | 
  177 |   test('shows Upload Court Document card', async ({ page }) => {
  178 |     await expect(page.locator('.v-card__title:has-text("Upload Court Document")')).toBeVisible();
  179 |   });
  180 | 
  181 |   test('shows Auto Sync Calendar card', async ({ page }) => {
  182 |     await expect(page.locator('.v-card__title:has-text("Auto Sync Calendar")')).toBeVisible();
  183 |   });
  184 | 
  185 |   test('shows Deadline Alerts card', async ({ page }) => {
  186 |     await expect(page.locator('.v-card__title:has-text("Deadline Alerts")')).toBeVisible();
  187 |   });
  188 | 
  189 |   test('Add Hearing button is visible', async ({ page }) => {
  190 |     await expect(page.locator('button:has-text("Add Hearing")')).toBeVisible();
  191 |   });
  192 | 
  193 |   test('can fill court name', async ({ page }) => {
  194 |     const courtInput = page.locator('.v-card:has(.v-card__title:has-text("Add Hearing")) input[type="text"]').first();
  195 |     await courtInput.fill('Supreme Court');
  196 |     await expect(courtInput).toHaveValue('Supreme Court');
  197 |   });
  198 | 
  199 |   test('Refresh Alerts button is visible', async ({ page }) => {
  200 |     await expect(page.locator('button:has-text("Refresh Alerts")')).toBeVisible();
  201 |   });
  202 | 
  203 |   test('clicking Refresh Alerts does not crash', async ({ page }) => {
  204 |     const errors = [];
  205 |     page.on('pageerror', err => errors.push(err.message));
  206 |     await page.locator('button:has-text("Refresh Alerts")').click();
  207 |     await page.waitForTimeout(1000);
  208 |     expect(errors).toHaveLength(0);
  209 |   });
  210 | 
  211 |   test('Upload Court Doc button is visible', async ({ page }) => {
  212 |     await expect(page.locator('button:has-text("Upload Court Doc")')).toBeVisible();
  213 |   });
  214 | 
  215 |   test('Track Decision button is visible', async ({ page }) => {
  216 |     await expect(page.locator('button:has-text("Track Decision")')).toBeVisible();
  217 |   });
  218 | });
  219 | 
  220 | test.describe('Lawyer Case Workspace — Client Communication tab', () => {
  221 |   test.beforeEach(async ({ page }) => {
  222 |     await goToWorkspace(page);
> 223 |     await page.locator('.v-tab:has-text("Client Communication")').click();
      |                                                                   ^ Error: locator.click: Page crashed
  224 |     await page.waitForTimeout(500);
  225 |   });
  226 | 
  227 |   test('shows Send Messages card', async ({ page }) => {
  228 |     await expect(page.locator('.v-card__title:has-text("Send Messages")')).toBeVisible();
  229 |   });
  230 | 
  231 |   test('shows Request Documents card', async ({ page }) => {
  232 |     await expect(page.locator('.v-card__title:has-text("Request Documents")')).toBeVisible();
  233 |   });
  234 | 
  235 |   test('shows Conversation History card', async ({ page }) => {
  236 |     await expect(page.locator('.v-card__title:has-text("Conversation History")')).toBeVisible();
  237 |   });
  238 | 
  239 |   test('Send Message button is visible', async ({ page }) => {
  240 |     await expect(page.locator('button:has-text("Send Message")')).toBeVisible();
  241 |   });
  242 | 
  243 |   test('Share Case Update button is visible', async ({ page }) => {
  244 |     await expect(page.locator('button:has-text("Share Case Update")')).toBeVisible();
  245 |   });
  246 | 
  247 |   test('can type a message subject and body', async ({ page }) => {
  248 |     const card = page.locator('.v-card:has(.v-card__title:has-text("Send Messages"))');
  249 |     const inputs = card.locator('input[type="text"]');
  250 |     await inputs.nth(0).fill('Test subject');
  251 |     await expect(inputs.nth(0)).toHaveValue('Test subject');
  252 |     const msgBody = card.locator('textarea').first();
  253 |     await msgBody.fill('Hello client, this is a test message.');
  254 |     await expect(msgBody).toHaveValue('Hello client, this is a test message.');
  255 |   });
  256 | 
  257 |   test('Request Documents button is visible', async ({ page }) => {
  258 |     await expect(page.locator('button:has-text("Request Documents")')).toBeVisible();
  259 |   });
  260 | 
  261 |   test('Schedule Meeting button is visible', async ({ page }) => {
  262 |     await expect(page.locator('.v-card:has(.v-card__title:has-text("Request Documents")) button:has-text("Schedule Meeting")')).toBeVisible();
  263 |   });
  264 | });
  265 | 
  266 | test.describe('Lawyer Case Workspace — Billing tab', () => {
  267 |   test.beforeEach(async ({ page }) => {
  268 |     await goToWorkspace(page);
  269 |     await page.locator('.v-tab:has-text("Billing")').click();
  270 |     await page.waitForTimeout(500);
  271 |   });
  272 | 
  273 |   test('shows Convert Time Logs to Invoice card', async ({ page }) => {
  274 |     await expect(page.locator('.v-card__title:has-text("Convert Time Logs to Invoice")')).toBeVisible();
  275 |   });
  276 | 
  277 |   test('shows Manage Retainer card', async ({ page }) => {
  278 |     await expect(page.locator('.v-card__title:has-text("Manage Retainer")')).toBeVisible();
  279 |   });
  280 | 
  281 |   test('shows Invoices & Payments card', async ({ page }) => {
  282 |     await expect(page.locator('.v-card__title:has-text("Invoices & Payments")')).toBeVisible();
  283 |   });
  284 | 
  285 |   test('Create Invoice button is visible', async ({ page }) => {
  286 |     await expect(page.locator('button:has-text("Create Invoice")')).toBeVisible();
  287 |   });
  288 | 
  289 |   test('Add Retainer button is visible', async ({ page }) => {
  290 |     await expect(page.locator('button:has-text("Add Retainer")')).toBeVisible();
  291 |   });
  292 | 
  293 |   test('can fill hourly rate', async ({ page }) => {
  294 |     const rateInput = page.locator('.v-card:has(.v-card__title:has-text("Convert Time Logs")) input[type="number"]').first();
  295 |     await rateInput.fill('150');
  296 |     await expect(rateInput).toHaveValue('150');
  297 |   });
  298 | 
  299 |   test('clicking Create Invoice does not crash', async ({ page }) => {
  300 |     const errors = [];
  301 |     page.on('pageerror', err => errors.push(err.message));
  302 |     await page.locator('button:has-text("Create Invoice")').click();
  303 |     await page.waitForTimeout(1000);
  304 |     expect(errors).toHaveLength(0);
  305 |   });
  306 | });
  307 | 
  308 | test.describe('Lawyer Case Workspace — Research tab', () => {
  309 |   test.beforeEach(async ({ page }) => {
  310 |     await goToWorkspace(page);
  311 |     await page.locator('.v-tab:has-text("Research")').click();
  312 |     await page.waitForTimeout(500);
  313 |   });
  314 | 
  315 |   test('shows Search Case Law card', async ({ page }) => {
  316 |     await expect(page.locator('.v-card__title:has-text("Search Case Law")')).toBeVisible();
  317 |   });
  318 | 
  319 |   test('shows Premium Research AI card', async ({ page }) => {
  320 |     await expect(page.locator('.v-card__title:has-text("Premium Research AI")')).toBeVisible();
  321 |   });
  322 | 
  323 |   test('shows Attached Research card', async ({ page }) => {
```