// Shared helpers for e2e tests

/**
 * Navigate to login and click Connexion to land on /dashboard
 */
async function login(page) {
  await page.goto('/');
  await page.locator('a.btn-primary, router-link.btn-primary, a:has-text("Connexion")').first().click();
  await page.waitForURL('**/dashboard');
}

module.exports = { login };
