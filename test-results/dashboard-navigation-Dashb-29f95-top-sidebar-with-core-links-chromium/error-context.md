# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-navigation.spec.ts >> Dashboard Navigation UI >> Desktop View >> should display the desktop sidebar with core links
- Location: tests\dashboard-navigation.spec.ts:18:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('aside').first().getByRole('link', { name: /dashboard/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('aside').first().getByRole('link', { name: /dashboard/i })

```

```yaml
- img "LeadBajaar"
- heading "LeadBajaar" [level=1]
- paragraph: CRM Platform
- region "Notifications alt+T"
- status:
  - img
  - text: Static route
  - button "Hide static indicator":
    - img
- alert: LeadBajaar
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { mockLogin } from './test-utils';
  3  | 
  4  | test.describe('Dashboard Navigation UI', () => {
  5  |   // Give sufficient timeout for Next.js dev server cold starts on auth routes
  6  |   test.setTimeout(90000);
  7  | 
  8  |   test.describe('Desktop View', () => {
  9  |     test.beforeEach(async ({ page }) => {
  10 |       await mockLogin(page);
  11 |       
  12 |       // Wait for the dashboard page to load
  13 |       await page.waitForURL('**/dashboard*', { timeout: 45000 });
  14 |       // Wait for Sidebar to be visible
  15 |       await page.waitForSelector('text=LeadBajaar', { timeout: 15000 });
  16 |     });
  17 | 
  18 |     test('should display the desktop sidebar with core links', async ({ page }) => {
  19 |       // Verify Sidebar branding by finding the image alt text or the div text
  20 |       await expect(page.getByAltText('LeadBajaar').first()).toBeVisible();
  21 |       
  22 |       // Verify core navigation links in sidebar
  23 |       const sidebar = page.locator('aside').first();
> 24 |       await expect(sidebar.getByRole('link', { name: /dashboard/i })).toBeVisible();
     |                                                                       ^ Error: expect(locator).toBeVisible() failed
  25 |       await expect(sidebar.getByRole('link', { name: /leads/i })).toBeVisible();
  26 |       await expect(sidebar.getByRole('link', { name: /live chat/i })).toBeVisible();
  27 |       await expect(sidebar.getByRole('link', { name: /meetings/i })).toBeVisible();
  28 |     });
  29 | 
  30 |     test('should be able to toggle the theme', async ({ page }) => {
  31 |       // Locate the theme toggle button in the header
  32 |       const themeToggle = page.getByRole('button', { name: /toggle theme/i });
  33 |       await expect(themeToggle).toBeVisible();
  34 |       
  35 |       // We can click it to ensure it doesn't crash the UI
  36 |       await themeToggle.click();
  37 |       
  38 |       // Verify that the HTML tag receives a class (usually Next Themes adds 'dark' or 'light')
  39 |       // Just waiting a short moment to ensure the click didn't throw a JS error is often enough
  40 |       await page.waitForTimeout(500);
  41 |       
  42 |       // Click again to revert
  43 |       await themeToggle.click();
  44 |     });
  45 |   });
  46 | 
  47 |   test.describe('Mobile View', () => {
  48 |     // Force mobile viewport
  49 |     test.use({ viewport: { width: 390, height: 844 }, isMobile: true });
  50 | 
  51 |     test.beforeEach(async ({ page }) => {
  52 |       await mockLogin(page);
  53 |       await page.waitForURL('**/dashboard*', { timeout: 45000 });
  54 |     });
  55 | 
  56 |     test('should open the mobile drawer when clicking the hamburger menu', async ({ page }) => {
  57 |       // Look for the hamburger menu button in the mobile header
  58 |       // The Menu icon from lucide-react has the 'lucide-menu' class
  59 |       const menuButton = page.locator('button', { has: page.locator('svg.lucide-menu') }).first();
  60 |       await expect(menuButton).toBeVisible();
  61 |       
  62 |       // Click the menu to open the drawer
  63 |       await menuButton.click();
  64 |       
  65 |       // Wait for the drawer to animate in and become visible
  66 |       // The drawer contains the sidebar branding text
  67 |       const drawerBranding = page.getByText('LeadBajaar', { exact: true }).last();
  68 |       await expect(drawerBranding).toBeVisible({ timeout: 10000 });
  69 |     });
  70 |   });
  71 | });
  72 | 
```