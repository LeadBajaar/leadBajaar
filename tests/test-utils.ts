import { Page, expect } from '@playwright/test';

/**
 * Performs a login operation by filling out the signin form and waiting for the API response.
 * This bypasses waiting for the /dashboard UI to compile, drastically speeding up tests.
 */
export async function mockLogin(page: Page) {
  await page.goto('/signin');
  
  // Fill out the login form
  await page.getByLabel('Work Email').fill('test@gmail.com');
  await page.getByLabel('Password').fill('test@123');
  
  // Intercept the API response instead of waiting for UI routing
  const loginPromise = page.waitForResponse(response => 
    response.url().includes('/login') && response.status() === 200, 
    { timeout: 45000 }
  );
  
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for the backend API to confirm login
  await loginPromise;
}
