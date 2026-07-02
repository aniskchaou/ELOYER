# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login-navigation.spec.js >> Navigation sidebar >> dark mode toggle switches theme
- Location: tests\e2e\login-navigation.spec.js:62:3

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not false
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
        - switch [checked] [ref=e138] [cursor=pointer]
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
      - heading "Dashboard" [level=1] [ref=e165]
      - generic [ref=e166]:
        - generic [ref=e168]:
          - heading "Active Cases" [level=2] [ref=e169]
          - paragraph [ref=e170]: "24"
        - generic [ref=e172]:
          - heading "Upcoming Hearings" [level=2] [ref=e173]
          - paragraph [ref=e174]: "5"
        - generic [ref=e176]:
          - heading "Pending Tasks" [level=2] [ref=e177]
          - paragraph [ref=e178]: "12"
        - generic [ref=e180]:
          - heading "Recent Payments" [level=2] [ref=e181]
          - paragraph [ref=e182]: $8200
      - generic [ref=e183]:
        - heading "Task Progress" [level=2] [ref=e186]
        - heading "Payment Trends" [level=2] [ref=e190]
      - generic [ref=e192]:
        - heading "Recent Activity" [level=2] [ref=e193]
        - list [ref=e194]:
          - listitem [ref=e195]:
            - generic [ref=e197]: 󰊛
            - generic [ref=e198]:
              - generic [ref=e199]: "New case added: Corporate Merger"
              - generic [ref=e200]: Sep 15, 2025
          - listitem [ref=e201]:
            - generic [ref=e203]: 󰄔
            - generic [ref=e204]:
              - generic [ref=e205]: Payment received from Jane Smith - $800
              - generic [ref=e206]: Sep 14, 2025
          - listitem [ref=e207]:
            - generic [ref=e209]: 󰅎
            - generic [ref=e210]:
              - generic [ref=e211]: "Task completed: File Appeal Document"
              - generic [ref=e212]: Sep 14, 2025
          - listitem [ref=e213]:
            - generic [ref=e215]: 󰃭
            - generic [ref=e216]:
              - generic [ref=e217]: Hearing scheduled for TechCorp
              - generic [ref=e218]: Sep 13, 2025
```

# Test source

```ts
  1  | // @ts-check
  2  | const { test, expect } = require('@playwright/test');
  3  | 
  4  | test.describe('Login page', () => {
  5  |   test('shows login form at root', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     await expect(page.locator('input[type="email"]')).toBeVisible();
  8  |     await expect(page.locator('input[type="password"]')).toBeVisible();
  9  |     await expect(page.locator('a:has-text("Connexion"), .btn:has-text("Connexion")')).toBeVisible();
  10 |   });
  11 | 
  12 |   test('login form has pre-filled credentials', async ({ page }) => {
  13 |     await page.goto('/');
  14 |     await expect(page.locator('input[type="email"]')).toHaveValue('admin@admin.com');
  15 |     await expect(page.locator('input[type="password"]')).toHaveValue('admin');
  16 |   });
  17 | 
  18 |   test('clicking Connexion navigates to dashboard', async ({ page }) => {
  19 |     await page.goto('/');
  20 |     await page.locator('a:has-text("Connexion"), .btn-primary:has-text("Connexion")').first().click();
  21 |     await page.waitForURL('**/dashboard');
  22 |     await expect(page).toHaveURL(/\/dashboard/);
  23 |   });
  24 | 
  25 |   test('login page shows logo', async ({ page }) => {
  26 |     await page.goto('/');
  27 |     await expect(page.locator('img[alt="..."], img[alt="Logo"]').first()).toBeVisible();
  28 |   });
  29 | 
  30 |   test('navigation and header are hidden on login page', async ({ page }) => {
  31 |     await page.goto('/');
  32 |     await expect(page.locator('.v-navigation-drawer')).toHaveCount(0);
  33 |   });
  34 | });
  35 | 
  36 | test.describe('Navigation sidebar', () => {
  37 |   test.beforeEach(async ({ page }) => {
  38 |     await page.goto('/dashboard');
  39 |   });
  40 | 
  41 |   test('shows navigation drawer on non-login pages', async ({ page }) => {
  42 |     await expect(page.locator('.v-navigation-drawer')).toBeVisible();
  43 |   });
  44 | 
  45 |   test('shows Eloyer brand title', async ({ page }) => {
  46 |     await expect(page.locator('.v-navigation-drawer')).toContainText('Eloyer');
  47 |     await expect(page.locator('.v-navigation-drawer')).toContainText('Legal Operations');
  48 |   });
  49 | 
  50 |   test('shows logo image', async ({ page }) => {
  51 |     await expect(page.locator('.v-navigation-drawer img').first()).toBeVisible();
  52 |   });
  53 | 
  54 |   test('shows role selector', async ({ page }) => {
  55 |     await expect(page.locator('.v-navigation-drawer .v-select')).toBeVisible();
  56 |   });
  57 | 
  58 |   test('dark mode toggle is visible', async ({ page }) => {
  59 |     await expect(page.locator('.v-navigation-drawer .v-input--switch')).toBeVisible();
  60 |   });
  61 | 
  62 |   test('dark mode toggle switches theme', async ({ page }) => {
  63 |     const toggle = page.locator('.v-navigation-drawer .v-input--switch input').first();
  64 |     const isDarkBefore = await page.evaluate(() =>
  65 |       document.documentElement.classList.contains('theme--dark')
  66 |     );
  67 |     await toggle.click({ force: true });
  68 |     await page.waitForTimeout(300);
  69 |     const isDarkAfter = await page.evaluate(() =>
  70 |       document.documentElement.classList.contains('theme--dark')
  71 |     );
> 72 |     expect(isDarkAfter).not.toBe(isDarkBefore);
     |                             ^ Error: expect(received).not.toBe(expected) // Object.is equality
  73 |   });
  74 | });
  75 | 
```