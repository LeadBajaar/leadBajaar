# LeadBajaar E2E Testing Guide

This guide documents the principles and patterns for writing and maintaining End-to-End (E2E) tests in the LeadBajaar application using Playwright.

## Core Principle: Implementation-First Testing

**Never guess locators.** The single most important rule when writing or updating tests in this repository is to **inspect the actual React component source code** before writing the test.

1.  **Check the component (`.tsx` file) first**: Look at how the element is rendered in the DOM. Is it an `<h1>` or just a `<div>`? What is the exact text? Is it conditionally rendered?
2.  **Use exact text matching for common words**: When testing UI text like "30 Min" or "Password", always prefer `getByText('...', { exact: true })` or `getByLabel('...', { exact: true })` to avoid strict-mode violations if the substring appears elsewhere on the page.
3.  **Respect UI Frameworks**: Remember that libraries like `react-hook-form` often replace native HTML5 validation (like `validity.valid`) with custom rendered error messages (e.g., `<p>Email is required</p>`). Assert on the *rendered* state, not the invisible native state unless explicitly configured to use native validation.
4.  **Check the default state**: If testing a data table (like `LeadsTable`), check the component's `visibleColumns` default array before assuming a column like "Email" is visible by default.

## API Mocking Strategy

When testing frontend behavior without relying on a running backend, use Playwright's `page.route` to mock API responses.

### 1. Identify the API Endpoint
Check the `page.tsx` or `api.ts` utility to find the exact endpoint called. The base URL is typically configured via `NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:8000/api`). Playwright mocks should use wildcard matchers for the domain: `**/api/endpoint-name`.

### 2. Match the Schema
Inspect the `.tsx` file to see how it unwraps the response. 
- Does it expect `response.json().data` or just the `response.json()` object directly?
- What properties does it read? (e.g., `id`, `title`, `duration`, `description`). Ensure your mock provides exactly these properties.

**Example Mock:**
```typescript
await page.route('**/api/event-types/discovery-call', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 101,
      title: 'Discovery Call',
      description: 'Initial 30 minute chat',
      duration: 30,
      scheduling: { timezone: 'UTC' }
    }),
  });
});
```

## Locator Best Practices

*   **Buttons**: Prefer `getByRole('button', { name: /text/i })`. Double-check the actual button text in the component (e.g., "New Event Type" instead of "Create").
*   **Forms**: Prefer `getByLabel('Label Name')` for inputs. Use `{ exact: true }` if there are multiple inputs sharing keywords (e.g., "Password" vs "Confirm Password").
*   **Headings**: Prefer `getByRole('heading', { name: 'Title' })`. However, verify in the `.tsx` file that the text is actually rendered inside an `<h1/2/3/4>` tag and not just a stylized `<div>`. If it's a `<div>`, use `getByText()`.
*   **Navigation**: Sidebar navigation should be scoped to its container if possible. For example, if the sidebar is an `<aside>`, use `page.locator('aside').getByRole('link', ...)` to avoid conflicts with mobile drawers.

## Test Structure

Group related tests using `test.describe()`. Use `test.beforeEach()` to handle common setup, like navigation and applying generic mocks. 

By adhering to these implementation-first guidelines, test flakiness and locator errors can be dramatically reduced, ensuring the E2E suite remains a reliable safety net for the application.
