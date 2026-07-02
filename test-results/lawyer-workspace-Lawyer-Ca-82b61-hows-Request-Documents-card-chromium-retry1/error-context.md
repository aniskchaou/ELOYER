# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lawyer-workspace.spec.js >> Lawyer Case Workspace — Client Communication tab >> shows Request Documents card
- Location: tests\e2e\lawyer-workspace.spec.js:231:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
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
      |                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
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