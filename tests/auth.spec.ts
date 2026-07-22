import { test, expect } from '@playwright/test';

test.describe('Authentication UI', () => {
  // Give sufficient timeout for Next.js dev server cold starts on auth routes
  test.setTimeout(90000);

  test.describe('Sign In Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/signin');
    });

    test('should display the correct layout and fields', async ({ page }) => {
      // Verify branding and main headings
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      
      // Verify form fields
      await expect(page.getByLabel('Work Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      
      // Verify links
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /create an account/i })).toBeVisible();
    });

    test('should show validation errors on empty submission', async ({ page }) => {
      // Submit empty form
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // We expect React Hook Form to render the error message
      await expect(page.getByText('Email is required')).toBeVisible();
      await expect(page.getByText('Password is required')).toBeVisible();
    });
  });

  test.describe('Sign Up Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should display the correct layout and fields', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
      
      await expect(page.getByLabel('Full Name')).toBeVisible();
      await expect(page.getByLabel('Work Email')).toBeVisible();
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
      
      await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    });
  });
});
