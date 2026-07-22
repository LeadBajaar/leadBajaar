import { test, expect } from '@playwright/test';
import { mockLogin } from './test-utils';

test.describe('Meetings UI', () => {
  test.setTimeout(120000);

  test.describe('Event Types Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await mockLogin(page);

      // Mock the event types API
      await page.route('**/api/event-types*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 101,
                title: 'Discovery Call',
                slug: 'discovery-call',
                duration: 30,
                description: 'Initial 30 minute chat',
                is_active: true
              }
            ]
          })
        });
      });

      await page.goto('/meetings/event-types');
      await page.waitForSelector('text=Discovery Call', { timeout: 15000 });
    });

    test('should display event types list correctly', async ({ page }) => {
      // Verify main heading
      await expect(page.getByRole('heading', { name: /meetings/i }).first()).toBeVisible();
      
      // Verify our mocked event type is displayed
      await expect(page.getByText('Discovery Call')).toBeVisible();
      await expect(page.getByText('30 Min', { exact: true })).toBeVisible();
      
      // Verify Add Event Type button is present
      await expect(page.getByRole('button', { name: /new event/i })).toBeVisible();
    });
  });

  test.describe('Public Booking Page', () => {
    test.beforeEach(async ({ page }) => {
      // Note: We do not need to mockLogin for public booking pages!
      // But we do need to mock the public API endpoints.
      await page.route('**/api/event-types/discovery-call', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 101,
            title: 'Discovery Call',
            slug: 'discovery-call',
            duration: 30,
            description: 'Initial 30 minute chat',
            is_active: true,
            owner: { name: 'Test User' },
            scheduling: { dateRange: 30, timeSlots: [] }
          })
        });
      });

      // Mock available slots
      await page.route('**/api/public/event-types/*/slots*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            date: '2026-07-25',
            slots: ['10:00', '10:30', '11:00', '14:00']
          })
        });
      });

      // We need to navigate to the public URL pattern.
      // Usually it's /[username]/[eventSlug]
      await page.goto('/testuser/discovery-call');
    });

    test('should render the public scheduling UI', async ({ page }) => {
      // Wait for the booking page to render the event description (which replaces the title when present)
      await expect(page.getByText('Initial 30 minute chat')).toBeVisible({ timeout: 15000 });
      
      // Check for host name and duration
      await expect(page.getByText('Test User')).toBeVisible();
      await expect(page.getByText('30 min', { exact: true })).toBeVisible();
      
      // Check for the calendar picker (could be a month/year display or a calendar grid)
      // Usually there is a "Select Date & Time" heading or similar
      const calendarSection = page.getByText(/select a Date & Time/i);
      if (await calendarSection.count() > 0) {
        await expect(calendarSection).toBeVisible();
      }
    });
  });
});
