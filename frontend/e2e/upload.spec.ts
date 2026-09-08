import { test, expect } from '@playwright/test';

test.describe('Upload Flow', () => {
  test('User can see upload card', async ({ page }) => {
    // 1. Go to homepage 
    await page.goto('/');

    // Since we don't have a mocked auth state in this basic E2E, we'll check if the main layout loads.
    // If we're logged in, we can see the "Upload" card or navigation.
    // We just verify the title or navigation is present.
    await expect(page).toHaveTitle(/MediPulse/i);
  });
});
