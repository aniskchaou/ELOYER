# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lawyer-portal.spec.js >> Lawyer Portal — Quick Actions dialogs >> Schedule Meeting dialog opens and closes
- Location: tests\e2e\lawyer-portal.spec.js:95:3

# Error details

```
Error: locator.click: Error: strict mode violation: locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first().locator('input') resolved to 2 elements:
    1) <input type="text" id="input-46" autocomplete="off" readonly="readonly" aria-readonly="false"/> aka getByRole('textbox', { name: 'Select Case' })
    2) <input value="1" type="hidden"/> aka locator('input').nth(5)

Call log:
  - waiting for locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first().locator('input')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - img "Logo" [ref=e8]
        - generic [ref=e9]:
          - generic [ref=e10]: Eloyer
          - generic [ref=e11]: Legal Operations
      - button "Current Role Admin" [ref=e15] [cursor=pointer]:
        - group
        - generic [ref=e16]:
          - generic [ref=e17]: Current Role
          - generic [ref=e18]:
            - generic [ref=e19]: Admin
            - textbox "Current Role" [ref=e20]
          - generic [ref=e23]: 󰍝
      - generic [ref=e24]:
        - generic [ref=e26]: 󱢼
        - generic [ref=e27]:
          - generic [ref=e28]: Admin
          - generic [ref=e29]: Role-based navigation active
        - generic [ref=e31]: Admin
      - separator [ref=e32]
      - button "Dashboard" [ref=e34] [cursor=pointer]:
        - generic [ref=e36]: 󰕮
        - generic [ref=e37]: Dashboard
        - generic [ref=e39]: 󰅀
      - button "Lawyer Portal" [ref=e41] [cursor=pointer]:
        - generic [ref=e43]: 󰳰
        - generic [ref=e44]: Lawyer Portal
        - generic [ref=e46]: 󰅀
      - button "Cases / Matters" [ref=e48] [cursor=pointer]:
        - generic [ref=e50]: 󰉋
        - generic [ref=e51]: Cases / Matters
        - generic [ref=e53]: 󰅀
      - button "Clients" [ref=e55] [cursor=pointer]:
        - generic [ref=e57]: 󰡉
        - generic [ref=e58]: Clients
        - generic [ref=e60]: 󰅀
      - button "Documents" [ref=e62] [cursor=pointer]:
        - generic [ref=e64]: 󰈙
        - generic [ref=e65]: Documents
        - generic [ref=e67]: 󰅀
      - button "Tasks & Calendar" [ref=e69] [cursor=pointer]:
        - generic [ref=e71]: 󰃯
        - generic [ref=e72]: Tasks & Calendar
        - generic [ref=e74]: 󰅀
      - button "Courts & Proceedings" [ref=e76] [cursor=pointer]:
        - generic [ref=e78]: 󰁰
        - generic [ref=e79]: Courts & Proceedings
        - generic [ref=e81]: 󰅀
      - button "Finance" [ref=e83] [cursor=pointer]:
        - generic [ref=e85]: 󰿯
        - generic [ref=e86]: Finance
        - generic [ref=e88]: 󰅀
      - button "Legal Research" [ref=e90] [cursor=pointer]:
        - generic [ref=e92]: 󰍉
        - generic [ref=e93]: Legal Research
        - generic [ref=e95]: 󰅀
      - button "Marketing & Leads" [ref=e97] [cursor=pointer]:
        - generic [ref=e99]: 󰃦
        - generic [ref=e100]: Marketing & Leads
        - generic [ref=e102]: 󰅀
      - button "Reports & Analytics" [ref=e104] [cursor=pointer]:
        - generic [ref=e106]: 󰄨
        - generic [ref=e107]: Reports & Analytics
        - generic [ref=e109]: 󰅀
      - button "Team / HR" [ref=e111] [cursor=pointer]:
        - generic [ref=e113]: 󰀎
        - generic [ref=e114]: Team / HR
        - generic [ref=e116]: 󰅀
      - button "Settings / Configuration" [ref=e118] [cursor=pointer]:
        - generic [ref=e120]: 󰒓
        - generic [ref=e121]: Settings / Configuration
        - generic [ref=e123]: 󰅀
      - button "AI & Advanced Features" [ref=e125] [cursor=pointer]:
        - generic [ref=e127]: 󰧑
        - generic [ref=e128]: AI & Advanced Features
        - generic [ref=e130]: 󰅀
      - separator [ref=e131]
      - generic [ref=e132]:
        - generic [ref=e133]: Dark Mode
        - switch [ref=e138] [cursor=pointer]
  - banner [ref=e142]:
    - generic [ref=e143]:
      - button "Toggle menu" [ref=e144] [cursor=pointer]:
        - generic [ref=e146]: 󰍜
      - generic [ref=e149]:
        - generic [ref=e152]: 󰍉
        - textbox "Search..." [ref=e154]
      - button [ref=e155] [cursor=pointer]:
        - generic [ref=e157]: 󰂜
      - button [ref=e158] [cursor=pointer]:
        - generic [ref=e160]: 󰀉
  - main [ref=e161]:
    - generic [ref=e164]:
      - generic [ref=e165]:
        - generic [ref=e166]:
          - heading "Lawyer Portal" [level=1] [ref=e167]
          - paragraph [ref=e168]: Start your day, prioritize work, and execute case actions fast.
        - button "Refresh" [ref=e170] [cursor=pointer]:
          - generic [ref=e171]:
            - generic [ref=e172]: 󰑐
            - text: Refresh
      - generic [ref=e173]:
        - generic [ref=e175]:
          - generic [ref=e176]: Start the Day
          - separator [ref=e177]
          - generic [ref=e178]:
            - generic [ref=e179]:
              - generic [ref=e180]:
                - generic [ref=e181]: Priority Cases
                - list [ref=e182]:
                  - listitem [ref=e183]:
                    - generic [ref=e184]:
                      - generic [ref=e185]: Property Dispute - Ben Ali
                      - generic [ref=e186]: Civil · in_progress
                    - button "Open Case" [ref=e188] [cursor=pointer]:
                      - generic [ref=e189]: Open Case
              - generic [ref=e190]:
                - generic [ref=e191]: Urgent Deadlines / Hearings
                - list [ref=e192]:
                  - listitem [ref=e193]:
                    - generic [ref=e194]:
                      - generic [ref=e195]: Property Dispute - Ben Ali
                      - generic [ref=e196]: 5/4/2026, 11:04:07 PM · Civil Court - Sousse
            - generic [ref=e197]:
              - generic [ref=e198]:
                - generic [ref=e199]: Today's Tasks
                - list [ref=e200]
              - generic [ref=e201]:
                - generic [ref=e202]: New Client Messages
                - list [ref=e203]:
                  - listitem [ref=e204]:
                    - generic [ref=e205]:
                      - generic [ref=e206]: New evidence available
                      - generic [ref=e207]: Ahmed Ben Ali · I have uploaded additional survey photos.
        - generic [ref=e208]:
          - generic [ref=e209]:
            - generic [ref=e210]: Quick Actions
            - separator [ref=e211]
            - generic [ref=e212]:
              - button "Select Case Property Dispute - Ben Ali" [ref=e215] [cursor=pointer]:
                - group
                - generic [ref=e216]:
                  - generic [ref=e217]: Select Case
                  - generic [ref=e218]:
                    - generic [ref=e219]: Property Dispute - Ben Ali
                    - textbox "Select Case" [ref=e220]
                  - generic [ref=e223]: 󰍝
              - button "Open Case" [ref=e226] [cursor=pointer]:
                - generic [ref=e227]:
                  - generic [ref=e228]: 󰝰
                  - text: Open Case
              - button "Add Note" [ref=e229] [cursor=pointer]:
                - generic [ref=e230]:
                  - generic [ref=e231]: 󰎜
                  - text: Add Note
              - button "Log Time" [ref=e232] [cursor=pointer]:
                - generic [ref=e233]:
                  - generic [ref=e234]: 󱫢
                  - text: Log Time
              - button "Schedule Meeting" [ref=e235] [cursor=pointer]:
                - generic [ref=e236]:
                  - generic [ref=e237]: 󰃳
                  - text: Schedule Meeting
          - generic [ref=e238]:
            - generic [ref=e239]: Pending Invoices / Payments
            - separator [ref=e240]
            - list [ref=e241]:
              - listitem [ref=e242]:
                - generic [ref=e243]:
                  - generic [ref=e244]: Property Dispute - Ben Ali
                  - generic [ref=e245]: pending · €1800.00 · due 5/6/2026, 11:04:07 PM
          - generic [ref=e246]:
            - generic [ref=e247]: Real Daily Workflow
            - separator [ref=e248]
            - list [ref=e249]:
              - listitem [ref=e250]:
                - generic [ref=e252]: 󰗡
                - generic [ref=e254]: Log in and review dashboard priorities
              - listitem [ref=e255]:
                - generic [ref=e257]: 󰗡
                - generic [ref=e259]: Open case and review notes/documents
              - listitem [ref=e260]:
                - generic [ref=e262]: 󰗡
                - generic [ref=e264]: Add updates, evidence, and next hearing/task
              - listitem [ref=e265]:
                - generic [ref=e267]: 󰗡
                - generic [ref=e269]: Log billable time and communicate with client
              - listitem [ref=e270]:
                - generic [ref=e272]: 󰗡
                - generic [ref=e274]: Prepare documents and schedule next action
      - generic [ref=e275]:
        - generic [ref=e277]:
          - generic [ref=e278]: Create New Case
          - separator [ref=e279]
          - generic [ref=e280]:
            - generic [ref=e283]:
              - group
              - generic [ref=e284]:
                - generic: Case title
                - textbox "Case title" [ref=e285]
            - generic [ref=e288]:
              - button "Case type General" [ref=e292] [cursor=pointer]:
                - group
                - generic [ref=e293]:
                  - generic [ref=e294]: Case type
                  - generic [ref=e295]:
                    - generic [ref=e296]: General
                    - textbox "Case type" [ref=e297]
                  - generic [ref=e300]: 󰍝
              - button "Status open" [ref=e306] [cursor=pointer]:
                - group
                - generic [ref=e307]:
                  - generic [ref=e308]: Status
                  - generic [ref=e309]:
                    - generic [ref=e310]: open
                    - textbox "Status" [ref=e311]
                  - generic [ref=e314]: 󰍝
            - button "Assign client(s)" [ref=e319] [cursor=pointer]:
              - group
              - generic [ref=e320]:
                - generic: Assign client(s)
                - textbox "Assign client(s)" [ref=e322]
                - generic [ref=e325]: 󰍝
            - generic [ref=e330]:
              - group
              - generic [ref=e331]:
                - generic: Case description
                - textbox "Case description" [ref=e332]
            - button "Create Case" [ref=e335] [cursor=pointer]:
              - generic [ref=e336]: Create Case
        - generic [ref=e338]:
          - generic [ref=e339]: Your Cases
          - separator [ref=e340]
          - generic [ref=e341]:
            - table [ref=e343]:
              - rowgroup [ref=e350]:
                - 'row "Title: Not sorted. Activate to sort ascending. Type: Not sorted. Activate to sort ascending. Status: Not sorted. Activate to sort ascending. Clients: Not sorted. Activate to sort ascending. Actions" [ref=e351]':
                  - 'columnheader "Title: Not sorted. Activate to sort ascending." [ref=e352] [cursor=pointer]':
                    - text: Title
                    - generic [ref=e353]: 󰁝
                  - 'columnheader "Type: Not sorted. Activate to sort ascending." [ref=e354] [cursor=pointer]':
                    - text: Type
                    - generic [ref=e355]: 󰁝
                  - 'columnheader "Status: Not sorted. Activate to sort ascending." [ref=e356] [cursor=pointer]':
                    - text: Status
                    - generic [ref=e357]: 󰁝
                  - 'columnheader "Clients: Not sorted. Activate to sort ascending." [ref=e358] [cursor=pointer]':
                    - text: Clients
                    - generic [ref=e359]: 󰁝
                  - columnheader "Actions" [ref=e360]
              - rowgroup [ref=e361]:
                - row "Property Dispute - Ben Ali Civil in_progress Open Case" [ref=e362]:
                  - cell "Property Dispute - Ben Ali" [ref=e363]
                  - cell "Civil" [ref=e364]
                  - cell "in_progress" [ref=e365]
                  - cell [ref=e366]
                  - cell "Open Case" [ref=e367]:
                    - button "Open Case" [ref=e368] [cursor=pointer]:
                      - generic [ref=e369]: Open Case
            - generic [ref=e370]:
              - generic [ref=e371]:
                - text: "Rows per page:"
                - button "10" [ref=e374] [cursor=pointer]:
                  - generic [ref=e375]:
                    - generic [ref=e376]:
                      - generic [ref=e377]: "10"
                      - textbox "Rows per page:"
                    - generic [ref=e380]: 󰍝
              - generic [ref=e381]: 1-1 of 1
              - generic [ref=e382]:
                - button "Previous page" [disabled]:
                  - generic:
                    - generic: 󰅁
              - generic [ref=e383]:
                - button "Next page" [disabled]:
                  - generic:
                    - generic: 󰅂
```

# Test source

```ts
  1   | // @ts-check
  2   | const { test, expect } = require('@playwright/test');
  3   | 
  4   | const BASE = '/lawyer/portal';
  5   | 
  6   | test.describe('Lawyer Portal — page load', () => {
  7   |   test.beforeEach(async ({ page }) => {
  8   |     await page.goto(BASE);
  9   |   });
  10  | 
  11  |   test('renders page title', async ({ page }) => {
  12  |     await expect(page.locator('h1, .text-h5')).toContainText('Lawyer Portal');
  13  |   });
  14  | 
  15  |   test('shows Refresh button', async ({ page }) => {
  16  |     await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
  17  |   });
  18  | 
  19  |   test('shows Start the Day card', async ({ page }) => {
  20  |     await expect(page.locator('.v-card-title:has-text("Start the Day"), .v-card__title:has-text("Start the Day")')).toBeVisible();
  21  |   });
  22  | 
  23  |   test('shows Quick Actions card', async ({ page }) => {
  24  |     await expect(page.locator('.v-card__title:has-text("Quick Actions"), .v-card-title:has-text("Quick Actions")')).toBeVisible();
  25  |   });
  26  | 
  27  |   test('shows Create New Case form', async ({ page }) => {
  28  |     await expect(page.locator('.v-card__title:has-text("Create New Case"), .v-card-title:has-text("Create New Case")')).toBeVisible();
  29  |   });
  30  | 
  31  |   test('shows Your Cases table', async ({ page }) => {
  32  |     await expect(page.locator('.v-card__title:has-text("Your Cases"), .v-card-title:has-text("Your Cases")')).toBeVisible();
  33  |   });
  34  | 
  35  |   test('shows Pending Invoices card', async ({ page }) => {
  36  |     await expect(page.locator('.v-card__title:has-text("Pending Invoices")')).toBeVisible();
  37  |   });
  38  | 
  39  |   test('shows Real Daily Workflow card', async ({ page }) => {
  40  |     await expect(page.locator('.v-card__title:has-text("Real Daily Workflow")')).toBeVisible();
  41  |   });
  42  | });
  43  | 
  44  | test.describe('Lawyer Portal — Refresh action', () => {
  45  |   test('Refresh button triggers data reload without errors', async ({ page }) => {
  46  |     await page.goto(BASE);
  47  |     const errors = [];
  48  |     page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  49  |     await page.locator('button:has-text("Refresh")').click();
  50  |     await page.waitForTimeout(1500);
  51  |     // No JS errors expected from clicking Refresh
  52  |     const fatalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('net::ERR'));
  53  |     expect(fatalErrors).toHaveLength(0);
  54  |   });
  55  | });
  56  | 
  57  | test.describe('Lawyer Portal — Quick Actions dialogs', () => {
  58  |   test.beforeEach(async ({ page }) => {
  59  |     await page.goto(BASE);
  60  |     await page.waitForTimeout(1500); // allow API to load
  61  |   });
  62  | 
  63  |   test('Add Note dialog opens and closes', async ({ page }) => {
  64  |     const addNoteBtn = page.locator('button:has-text("Add Note")').first();
  65  |     // Button may be disabled if no case selected — try to select first case
  66  |     const caseSelect = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first();
  67  |     const input = caseSelect.locator('input').first();
  68  |     await input.click({ force: true });
  69  |     await page.waitForTimeout(500);
  70  |     const firstOption = page.locator('.v-list-item').first();
  71  |     if (await firstOption.isVisible()) {
  72  |       await firstOption.click();
  73  |       await page.waitForTimeout(300);
  74  |     }
  75  |     await addNoteBtn.click({ force: true });
  76  |     await expect(page.locator('.v-dialog:visible .v-card__title:has-text("Add Note")')).toBeVisible();
  77  |     await page.locator('.v-dialog:visible button:has-text("Cancel")').click();
  78  |     await expect(page.locator('.v-dialog:visible')).toHaveCount(0);
  79  |   });
  80  | 
  81  |   test('Log Time dialog opens and closes', async ({ page }) => {
  82  |     const caseSelect = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first();
  83  |     await caseSelect.locator('input').click({ force: true });
  84  |     await page.waitForTimeout(400);
  85  |     const firstOption = page.locator('.v-list-item').first();
  86  |     if (await firstOption.isVisible()) await firstOption.click();
  87  |     await page.waitForTimeout(300);
  88  | 
  89  |     await page.locator('button:has-text("Log Time")').first().click({ force: true });
  90  |     await expect(page.locator('.v-dialog:visible .v-card__title:has-text("Log Time")')).toBeVisible();
  91  |     await page.locator('.v-dialog:visible button:has-text("Cancel")').click();
  92  |     await expect(page.locator('.v-dialog:visible')).toHaveCount(0);
  93  |   });
  94  | 
  95  |   test('Schedule Meeting dialog opens and closes', async ({ page }) => {
  96  |     const caseSelect = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first();
> 97  |     await caseSelect.locator('input').click({ force: true });
      |                                       ^ Error: locator.click: Error: strict mode violation: locator('.v-card:has(.v-card__title:has-text("Quick Actions")) .v-select').first().locator('input') resolved to 2 elements:
  98  |     await page.waitForTimeout(400);
  99  |     const firstOption = page.locator('.v-list-item').first();
  100 |     if (await firstOption.isVisible()) await firstOption.click();
  101 |     await page.waitForTimeout(300);
  102 | 
  103 |     await page.locator('button:has-text("Schedule Meeting")').first().click({ force: true });
  104 |     await expect(page.locator('.v-dialog:visible .v-card__title:has-text("Schedule Meeting")')).toBeVisible();
  105 |     await page.locator('.v-dialog:visible button:has-text("Cancel")').click();
  106 |     await expect(page.locator('.v-dialog:visible')).toHaveCount(0);
  107 |   });
  108 | });
  109 | 
  110 | test.describe('Lawyer Portal — Create New Case form', () => {
  111 |   test.beforeEach(async ({ page }) => {
  112 |     await page.goto(BASE);
  113 |     await page.waitForTimeout(1000);
  114 |   });
  115 | 
  116 |   test('can type in case title field', async ({ page }) => {
  117 |     const titleField = page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) input[type="text"]').first();
  118 |     await titleField.fill('Test Case from Playwright');
  119 |     await expect(titleField).toHaveValue('Test Case from Playwright');
  120 |   });
  121 | 
  122 |   test('can type in case description', async ({ page }) => {
  123 |     const descField = page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) textarea').first();
  124 |     await descField.fill('Playwright test description');
  125 |     await expect(descField).toHaveValue('Playwright test description');
  126 |   });
  127 | 
  128 |   test('Create Case button is visible', async ({ page }) => {
  129 |     await expect(page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) button:has-text("Create Case")')).toBeVisible();
  130 |   });
  131 | 
  132 |   test('submitting empty title shows no crash', async ({ page }) => {
  133 |     const errors = [];
  134 |     page.on('pageerror', err => errors.push(err.message));
  135 |     await page.locator('.v-card:has(.v-card__title:has-text("Create New Case")) button:has-text("Create Case")').click();
  136 |     await page.waitForTimeout(1000);
  137 |     expect(errors).toHaveLength(0);
  138 |   });
  139 | });
  140 | 
  141 | test.describe('Lawyer Portal — Open Case navigation', () => {
  142 |   test('Open Case button in Quick Actions navigates to workspace', async ({ page }) => {
  143 |     await page.goto(BASE);
  144 |     await page.waitForTimeout(1500);
  145 |     const openCaseBtn = page.locator('.v-card:has(.v-card__title:has-text("Quick Actions")) button:has-text("Open Case")').first();
  146 |     // Only click if a case is selected (button not disabled)
  147 |     const isDisabled = await openCaseBtn.getAttribute('disabled');
  148 |     if (isDisabled === null) {
  149 |       await openCaseBtn.click();
  150 |       await expect(page).toHaveURL(/\/lawyer\/cases\//);
  151 |     } else {
  152 |       test.info().annotations.push({ type: 'info', description: 'No case available to open' });
  153 |     }
  154 |   });
  155 | 
  156 |   test('"Open Case" button in Priority Cases list works', async ({ page }) => {
  157 |     await page.goto(BASE);
  158 |     await page.waitForTimeout(1500);
  159 |     const openBtn = page.locator('.v-card:has(.v-card__title:has-text("Start the Day")) button:has-text("Open Case")').first();
  160 |     if (await openBtn.isVisible()) {
  161 |       await openBtn.click();
  162 |       await expect(page).toHaveURL(/\/lawyer\/cases\//);
  163 |     }
  164 |   });
  165 | });
  166 | 
```