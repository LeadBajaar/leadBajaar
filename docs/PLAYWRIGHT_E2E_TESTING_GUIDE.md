# Playwright E2E Testing Guide

This document outlines the setup, architecture, and best practices for the Playwright E2E testing suite in LeadBajaar.

## Overview

The LeadBajaar frontend uses [Playwright](https://playwright.dev/) for robust, cross-browser UI testing. The tests are designed to run against the Next.js development or production server and ensure that critical components—specifically complex, data-driven interfaces like `LeadsMobileView`—render correctly across both desktop and mobile viewports.

## Running the Tests

We have configured two primary NPM scripts in `package.json` for running the tests:

- **Run in headless mode (CI/CD standard):**
  ```bash
  npm run test:e2e
  ```
  *This will run all tests in the background and output the results to the terminal.*

- **Run in UI mode (Debugging & Development):**
  ```bash
  npm run test:e2e:ui
  ```
  *This opens the Playwright UI, allowing you to visually step through the tests, inspect the DOM at every stage, and view network traces.*

## Best Practices & Patterns Used

Writing reliable E2E tests for a Next.js application requires navigating cold-start delays, authentication state, and dynamic data. The following best practices have been implemented and should be maintained when writing new tests:

### 1. Handling Next.js Dev Server Cold Starts
Next.js compiles routes on-demand during development (`npm run dev`). Navigating through multiple pages (e.g., `/signin` -> `/dashboard` -> `/leads`) can take upwards of 30–60 seconds on the first run, leading to standard timeout failures.

**Solutions implemented:**
- **Global Timeouts:** Test timeouts are explicitly increased to account for compilation (`test.setTimeout(120000);`).
- **Optimized Navigation:** Instead of waiting for a heavy UI route to compile after an action, we wait for the backend API response and then navigate directly to the target testing page. 
  ```typescript
  // Wait for the backend API to confirm login instead of waiting for /dashboard to compile!
  const loginPromise = page.waitForResponse(response => 
    response.url().includes('/login') && response.status() === 200
  );
  await page.getByRole('button', { name: /sign in/i }).click();
  await loginPromise;
  
  await page.goto('/leads');
  ```

### 2. Mocking Data for UI Components
E2E tests should be deterministic. Relying on the live state of a local or staging database is brittle—if the test user has no leads, or if a lead lacks a specific field (like `phone`), assertions looking for those specific UI elements will fail.

**Solutions implemented:**
- **Network Interception:** Use `page.route` to mock the API responses that populate the UI being tested. This guarantees the frontend receives exactly the data needed to render all component variations.
  ```typescript
  await page.route('**/api/leads*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [{
          id: 9999,
          name: 'Test Mock Lead',
          phone: '+1234567890',
          city: 'Mock City'
        }]
      })
    });
  });
  ```

### 3. Testing Mobile-Specific Components
LeadBajaar uses responsive design techniques (e.g., Tailwind's `hidden lg:block`). If you are testing a component that only appears on mobile (like `LeadsMobileView`), you must ensure the test runner forces a mobile viewport, regardless of whether Playwright runs the test via its Desktop Chromium or Mobile Chrome worker.

**Solutions implemented:**
- **Viewport Overrides:** Force a mobile viewport at the top of a mobile-specific test suite.
  ```typescript
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });
  ```

### 4. Resilient Locators
Tests should not rely on brittle CSS classes or specific HTML tags if the UI design is subject to change.

**Solutions implemented:**
- **Accessible & Content Locators:** Locate elements by their user-facing text, `aria-labels`, or unique structural contents (like a specific SVG icon) rather than raw HTML tags.
  ```typescript
  // Bad: Fails if the button is changed to an <a> tag
  const callButton = page.locator('a[href^="tel:"]').first();
  
  // Good: Finds the button based on the SVG icon it contains
  const callButton = page.locator('button', { has: page.locator('svg.lucide-phone') }).first();
  ```

## Adding New Tests

1. Place new test files in the `tests/` directory with the `.spec.ts` extension.
2. Review `tests/leads.spec.ts` as a template for handling login state and API mocking.
3. Use `npm run test:e2e:ui` while developing to leverage the Playwright trace viewer for fast debugging.
