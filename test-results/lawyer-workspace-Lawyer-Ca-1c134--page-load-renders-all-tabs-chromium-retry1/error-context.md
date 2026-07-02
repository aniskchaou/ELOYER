# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lawyer-workspace.spec.js >> Lawyer Case Workspace — page load >> renders all tabs
- Location: tests\e2e\lawyer-workspace.spec.js:43:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.v-tab:has-text("Client Communication")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.v-tab:has-text("Client Communication")')

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
          - heading "Lawyer Daily Workspace" [level=1] [ref=e167]
          - paragraph [ref=e168]: Open case, review/update evidence, log time, collaborate with client, bill work, and use AI assistance.
        - generic [ref=e169]:
          - button "Back to Portal" [ref=e170] [cursor=pointer]:
            - generic [ref=e171]: Back to Portal
          - button "Refresh" [ref=e172] [cursor=pointer]:
            - generic [ref=e173]: Refresh
      - generic [ref=e174]:
        - generic [ref=e175]: Property Dispute - Ben Ali
        - generic [ref=e176]: "Civil · status: in_progress · clients: None"
        - separator [ref=e177]
        - generic [ref=e179]:
          - paragraph [ref=e181]: Land ownership dispute and title verification.
          - generic [ref=e182]:
            - button "Case Status in_progress" [ref=e185] [cursor=pointer]:
              - group
              - generic [ref=e186]:
                - generic [ref=e187]: Case Status
                - generic [ref=e188]:
                  - generic [ref=e189]: in_progress
                  - textbox "Case Status" [ref=e190]
                - generic [ref=e193]: 󰍝
            - button "Update Status" [ref=e196] [cursor=pointer]:
              - generic [ref=e197]: Update Status
      - tablist [ref=e199]:
        - generic [ref=e201]:
          - tab "Documents" [selected] [ref=e204] [cursor=pointer]
          - tab "Time & Tasks" [ref=e205] [cursor=pointer]
          - tab "Court & Hearings" [ref=e206] [cursor=pointer]
          - tab "Clients" [ref=e207] [cursor=pointer]
          - tab "Billing" [ref=e208] [cursor=pointer]
          - tab "Research" [ref=e209] [cursor=pointer]
          - tab "Performance" [ref=e210] [cursor=pointer]
          - tab "AI Advanced" [ref=e211] [cursor=pointer]
        - generic [ref=e213] [cursor=pointer]: 󰅂
      - generic [ref=e217]:
        - generic [ref=e218]:
          - generic [ref=e219]:
            - generic [ref=e220]: Create Document From Template
            - separator [ref=e221]
            - generic [ref=e222]:
              - button "Template" [ref=e225] [cursor=pointer]:
                - group
                - generic [ref=e226]:
                  - generic: Template
                  - textbox "Template" [ref=e228]
                  - generic [ref=e231]: 󰍝
              - generic [ref=e236]:
                - group
                - generic [ref=e237]:
                  - generic: Document title
                  - textbox "Document title" [ref=e238]
              - generic [ref=e243] [cursor=pointer]:
                - switch "Premium enabled" [checked] [ref=e245]
                - generic [ref=e247]: Premium enabled
              - button "Create (Auto-fill client data)" [ref=e249] [cursor=pointer]:
                - generic [ref=e250]: Create (Auto-fill client data)
          - generic [ref=e251]:
            - generic [ref=e252]: Edit Contract / Save New Version
            - separator [ref=e253]
            - generic [ref=e254]:
              - button "Document" [ref=e257] [cursor=pointer]:
                - group
                - generic [ref=e258]:
                  - generic: Document
                  - textbox "Document" [ref=e260]
                  - generic [ref=e263]: 󰍝
              - generic [ref=e268]:
                - group
                - generic [ref=e269]:
                  - generic: Updated contract content
                  - textbox "Updated contract content" [ref=e270]
              - generic [ref=e275]:
                - group
                - generic [ref=e276]:
                  - generic: Change summary
                  - textbox "Change summary" [ref=e277]
              - button "Save Version" [ref=e280] [cursor=pointer]:
                - generic [ref=e281]: Save Version
        - generic [ref=e282]:
          - generic [ref=e283]:
            - generic [ref=e284]: Upload External Document
            - separator [ref=e285]
            - generic [ref=e286]:
              - generic [ref=e289]:
                - group
                - generic [ref=e290]:
                  - generic: Title
                  - textbox "Title" [ref=e291]
              - generic [ref=e296]:
                - group
                - generic [ref=e297]:
                  - generic: External URL
                  - textbox "External URL" [ref=e298]
              - button "Upload" [ref=e301] [cursor=pointer]:
                - generic [ref=e302]: Upload
          - generic [ref=e303]:
            - generic [ref=e304]: Compare Versions
            - separator [ref=e305]
            - generic [ref=e306]:
              - button "Document" [ref=e309] [cursor=pointer]:
                - group
                - generic [ref=e310]:
                  - generic: Document
                  - textbox "Document" [ref=e312]
                  - generic [ref=e315]: 󰍝
              - generic [ref=e318]:
                - generic [ref=e322]:
                  - group
                  - generic [ref=e323]:
                    - generic [ref=e324]: From version
                    - spinbutton "From version" [ref=e325]: "1"
                - generic [ref=e331]:
                  - group
                  - generic [ref=e332]:
                    - generic [ref=e333]: To version
                    - spinbutton "To version" [ref=e334]: "2"
              - button "Compare" [ref=e337] [cursor=pointer]:
                - generic [ref=e338]: Compare
          - generic [ref=e339]:
            - generic [ref=e340]: E-Sign & AI Summarize
            - separator [ref=e341]
            - generic [ref=e342]:
              - button "Document for e-sign" [ref=e345] [cursor=pointer]:
                - group
                - generic [ref=e346]:
                  - generic: Document for e-sign
                  - textbox "Document for e-sign" [ref=e348]
                  - generic [ref=e351]: 󰍝
              - button "Client" [ref=e356] [cursor=pointer]:
                - group
                - generic [ref=e357]:
                  - generic: Client
                  - textbox "Client" [ref=e359]
                  - generic [ref=e362]: 󰍝
              - button "Send for E-signature" [ref=e365] [cursor=pointer]:
                - generic [ref=e366]: Send for E-signature
              - button "AI Summarize" [ref=e367] [cursor=pointer]:
                - generic [ref=e368]: AI Summarize
```

# Test source

```ts
  1   | // @ts-check
  2   | const { test, expect } = require('@playwright/test');
  3   | 
  4   | // Helper: navigate to the workspace for case ID 1 (or first available)
  5   | async function goToWorkspace(page, caseId = 1) {
  6   |   await page.goto(`/lawyer/cases/${caseId}`);
  7   |   await page.waitForTimeout(1500);
  8   | }
  9   | 
  10  | // Tab names as rendered by the component
  11  | const TABS = [
  12  |   'Documents',
  13  |   'Time & Tasks',
  14  |   'Court & Hearings',
  15  |   'Client Communication',
  16  |   'Billing',
  17  |   'Research',
  18  |   'Performance',
  19  | ];
  20  | 
  21  | test.describe('Lawyer Case Workspace — page load', () => {
  22  |   test.beforeEach(async ({ page }) => {
  23  |     await goToWorkspace(page);
  24  |   });
  25  | 
  26  |   test('renders workspace title', async ({ page }) => {
  27  |     await expect(page.locator('h1, .text-h5').first()).toContainText('Lawyer Daily Workspace');
  28  |   });
  29  | 
  30  |   test('shows Back to Portal button', async ({ page }) => {
  31  |     await expect(page.locator('button:has-text("Back to Portal")')).toBeVisible();
  32  |   });
  33  | 
  34  |   test('Back to Portal returns to /lawyer/portal', async ({ page }) => {
  35  |     await page.locator('button:has-text("Back to Portal")').click();
  36  |     await expect(page).toHaveURL(/\/lawyer\/portal/);
  37  |   });
  38  | 
  39  |   test('shows Refresh button', async ({ page }) => {
  40  |     await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
  41  |   });
  42  | 
  43  |   test('renders all tabs', async ({ page }) => {
  44  |     for (const tab of TABS) {
> 45  |       await expect(page.locator(`.v-tab:has-text("${tab}")`)).toBeVisible();
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  46  |     }
  47  |   });
  48  | });
  49  | 
  50  | test.describe('Lawyer Case Workspace — Documents tab', () => {
  51  |   test.beforeEach(async ({ page }) => {
  52  |     await goToWorkspace(page);
  53  |     await page.locator('.v-tab:has-text("Documents")').click();
  54  |     await page.waitForTimeout(500);
  55  |   });
  56  | 
  57  |   test('shows Create Document From Template card', async ({ page }) => {
  58  |     await expect(page.locator('.v-card__title:has-text("Create Document From Template")')).toBeVisible();
  59  |   });
  60  | 
  61  |   test('shows Edit Contract card', async ({ page }) => {
  62  |     await expect(page.locator('.v-card__title:has-text("Edit Contract")')).toBeVisible();
  63  |   });
  64  | 
  65  |   test('shows Upload External Document card', async ({ page }) => {
  66  |     await expect(page.locator('.v-card__title:has-text("Upload External Document")')).toBeVisible();
  67  |   });
  68  | 
  69  |   test('shows Compare Versions card', async ({ page }) => {
  70  |     await expect(page.locator('.v-card__title:has-text("Compare Versions")')).toBeVisible();
  71  |   });
  72  | 
  73  |   test('shows E-Sign & AI Summarize card', async ({ page }) => {
  74  |     await expect(page.locator('.v-card__title:has-text("E-Sign")')).toBeVisible();
  75  |   });
  76  | 
  77  |   test('can fill external document title and URL', async ({ page }) => {
  78  |     const card = page.locator('.v-card:has(.v-card__title:has-text("Upload External Document"))');
  79  |     await card.locator('input').nth(0).fill('Playwright Doc');
  80  |     await card.locator('input').nth(1).fill('https://example.com/doc.pdf');
  81  |     await expect(card.locator('input').nth(0)).toHaveValue('Playwright Doc');
  82  |   });
  83  | 
  84  |   test('Upload button is visible', async ({ page }) => {
  85  |     await expect(page.locator('.v-card:has(.v-card__title:has-text("Upload External Document")) button:has-text("Upload")')).toBeVisible();
  86  |   });
  87  | 
  88  |   test('E-Sign button is visible', async ({ page }) => {
  89  |     await expect(page.locator('button:has-text("Send for E-signature")')).toBeVisible();
  90  |   });
  91  | 
  92  |   test('AI Summarize button is visible', async ({ page }) => {
  93  |     await expect(page.locator('button:has-text("AI Summarize")')).toBeVisible();
  94  |   });
  95  | 
  96  |   test('clicking AI Summarize does not crash', async ({ page }) => {
  97  |     const errors = [];
  98  |     page.on('pageerror', err => errors.push(err.message));
  99  |     await page.locator('button:has-text("AI Summarize")').click();
  100 |     await page.waitForTimeout(1000);
  101 |     expect(errors).toHaveLength(0);
  102 |   });
  103 | 
  104 |   test('Compare Versions button is visible', async ({ page }) => {
  105 |     await expect(page.locator('.v-card:has(.v-card__title:has-text("Compare Versions")) button:has-text("Compare")')).toBeVisible();
  106 |   });
  107 | });
  108 | 
  109 | test.describe('Lawyer Case Workspace — Time & Tasks tab', () => {
  110 |   test.beforeEach(async ({ page }) => {
  111 |     await goToWorkspace(page);
  112 |     await page.locator('.v-tab:has-text("Time & Tasks")').click();
  113 |     await page.waitForTimeout(500);
  114 |   });
  115 | 
  116 |   test('shows Log Billable Hours card', async ({ page }) => {
  117 |     await expect(page.locator('.v-card__title:has-text("Log Billable Hours")')).toBeVisible();
  118 |   });
  119 | 
  120 |   test('shows Start / Stop Timer card', async ({ page }) => {
  121 |     await expect(page.locator('.v-card__title:has-text("Start / Stop Timer")')).toBeVisible();
  122 |   });
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
```