import { test, expect } from '@playwright/test';
import { mockLogin } from './test-utils';

test.describe('Leads Mobile View UI', () => {
  // Force mobile viewport so LeadsMobileView is rendered instead of Desktop view
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });
  // Increase global timeout heavily because Next.js dev server compiles 
  // multiple routes on the fly (/signin, /leads) which can take well over a minute.
  test.setTimeout(120000); // 120 seconds

  test.beforeEach(async ({ page }) => {
    // Playwright Best Practice: Use the shared login utility
    await mockLogin(page);

    // Playwright Best Practice: Mock the API response to guarantee test data!
    // Relying on a live database is brittle because the user might have no leads.
    await page.route('**/api/leads*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 9999,
              name: 'Test Mock Lead',
              phone: '+1234567890',
              city: 'Mock City',
              profession: 'Mock Profession',
              company: 'Mock Company',
              status: 'new',
              created_at: new Date().toISOString()
            }
          ],
          current_page: 1,
          last_page: 1,
          total: 1
        })
      });
    });

    // Navigate to the leads dashboard for testing
    await page.goto('/leads');
    
    // Wait for the mock API response to be processed and the UI to render
    await page.waitForSelector('text=Test Mock Lead', { timeout: 15000 });
  });

  test('should display city and profession icons properly', async ({ page }) => {
    // We locate the sub-info row by looking for a div that has the 12px font size 
    // AND contains at least one of the icons we recently added.
    const subInfoRow = page.locator('div.text-\\[12px\\]', { 
      has: page.locator('svg.lucide-briefcase, svg.lucide-building-2, svg.lucide-map-pin') 
    }).first();
    
    // Check if the sub-info row is visible
    await expect(subInfoRow).toBeVisible({ timeout: 15000 });

    // Check that our newly added font styles are applied correctly
    await expect(subInfoRow).toHaveCSS('font-size', '12px');
    await expect(subInfoRow).toHaveCSS('font-weight', '500'); // medium
  });

  test('should have an enabled Call button when phone is present', async ({ page }) => {
    // In LeadsMobileView, the bottom action row contains a Call button.
    // It currently doesn't have an aria-label, so we locate it by the Phone icon SVG.
    const callButton = page.locator('button', { has: page.locator('svg.lucide-phone') }).first();
    
    // We wait for it to be attached
    await expect(callButton).toBeAttached({ timeout: 15000 });
    
    // Since our mock lead has a phone number ('+1234567890'), the button should be enabled
    await expect(callButton).toBeEnabled();
  });
});

test.describe('Leads Desktop View UI', () => {
  // Force desktop viewport
  test.use({ viewport: { width: 1280, height: 720 }, isMobile: false });
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
    await page.route('**/api/leads*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{
            id: 8888,
            name: 'Desktop Mock Lead',
            email: 'desktop@mock.com',
            phone: '+0987654321',
            status: 'new',
            stage: 'Lead In',
            created_at: new Date().toISOString()
          }],
          current_page: 1, last_page: 1, total: 1
        })
      });
    });
    
    // Mock the stages API which is used by Kanban board and table filters
    await page.route('**/api/stages', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Lead In', color: 'bg-blue-500' },
          { id: 2, name: 'Follow Up', color: 'bg-yellow-500' }
        ])
      });
    });

    await page.goto('/leads');
    await page.waitForSelector('text=Desktop Mock Lead', { timeout: 15000 });
  });

  test('should display the data table with correct columns', async ({ page }) => {
    // Check for the table element
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify some column headers exist
    await expect(table.locator('th', { hasText: /name/i })).toBeVisible();
    await expect(table.locator('th', { hasText: /phone/i })).toBeVisible();
    await expect(table.locator('th', { hasText: /stage/i })).toBeVisible();
    
    // Verify our mock data is in the table row
    const row = table.locator('tbody tr').first();
    await expect(row).toContainText('Desktop Mock Lead');
    await expect(row).toContainText('desktop@mock.com');
  });

  test('should open the Add Lead modal', async ({ page }) => {
    // Click the Add Lead button
    const addButton = page.getByRole('button', { name: /add lead/i });
    await addButton.click();

    // Verify the modal opens
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: /add new lead/i })).toBeVisible();
    
    // Check form fields
    await expect(modal.getByLabel(/name/i)).toBeVisible();
    await expect(modal.getByLabel(/email/i)).toBeVisible();
    await expect(modal.getByLabel(/phone/i)).toBeVisible();
    
    // Close it
    await page.keyboard.press('Escape');
  });

  test('should render the Kanban board view', async ({ page }) => {
    // Switch to Kanban view (there should be a Stages or Kanban button/tab)
    // Looking for a button that toggles views. Often it's a tab or button with an icon.
    // In our app, there is a button named "Stages" or a layout toggle.
    // The previous snapshot showed a button named "Stages"
    const stagesButton = page.getByRole('button', { name: /stages/i });
    await expect(stagesButton).toBeVisible();
    await stagesButton.click();

    // The Kanban board columns should appear based on our mocked stages
    await expect(page.getByText('Lead In').first()).toBeVisible();
    await expect(page.getByText('Follow Up').first()).toBeVisible();

    // Our mock lead should be in the Kanban board
    await expect(page.locator('text=Desktop Mock Lead').first()).toBeVisible();
  });
});
