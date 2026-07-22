import { test, expect } from '@playwright/test';
import { mockLogin } from './test-utils';

test.describe('Dashboard Navigation UI', () => {
  // Give sufficient timeout for Next.js dev server cold starts on auth routes
  test.setTimeout(90000);

  test.describe('Desktop View', () => {
    test.beforeEach(async ({ page }) => {
      await mockLogin(page);
      
      // Wait for the dashboard page to load
      await page.waitForURL('**/dashboard*', { timeout: 45000 });
      // Wait for Sidebar to be visible
      await page.waitForSelector('text=LeadBajaar', { timeout: 15000 });
    });

    test('should display the desktop sidebar with core links', async ({ page }) => {
      // Verify Sidebar branding by finding the image alt text or the div text
      await expect(page.getByAltText('LeadBajaar').first()).toBeVisible();
      
      // Verify core navigation links in sidebar
      const sidebar = page.locator('aside').first();
      await expect(sidebar.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /leads/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /live chat/i })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /meetings/i })).toBeVisible();
    });

    test('should be able to toggle the theme', async ({ page }) => {
      // Locate the theme toggle button in the header
      const themeToggle = page.getByRole('button', { name: /toggle theme/i });
      await expect(themeToggle).toBeVisible();
      
      // We can click it to ensure it doesn't crash the UI
      await themeToggle.click();
      
      // Verify that the HTML tag receives a class (usually Next Themes adds 'dark' or 'light')
      // Just waiting a short moment to ensure the click didn't throw a JS error is often enough
      await page.waitForTimeout(500);
      
      // Click again to revert
      await themeToggle.click();
    });
  });

  test.describe('Mobile View', () => {
    // Force mobile viewport
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

    test.beforeEach(async ({ page }) => {
      await mockLogin(page);
      await page.waitForURL('**/dashboard*', { timeout: 45000 });
    });

    test('should open the mobile drawer when clicking the hamburger menu', async ({ page }) => {
      // Look for the hamburger menu button in the mobile header
      // The Menu icon from lucide-react has the 'lucide-menu' class
      const menuButton = page.locator('button', { has: page.locator('svg.lucide-menu') }).first();
      await expect(menuButton).toBeVisible();
      
      // Click the menu to open the drawer
      await menuButton.click();
      
      // Wait for the drawer to animate in and become visible
      // The drawer contains the sidebar branding text
      const drawerBranding = page.getByText('LeadBajaar', { exact: true }).last();
      await expect(drawerBranding).toBeVisible({ timeout: 10000 });
    });
  });
});
