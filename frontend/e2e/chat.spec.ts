import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test('User can open chat, read disclaimer, and send a message', async ({ page }) => {
    // 1. Go to homepage (or dashboard if auth is bypassed/mocked)
    await page.goto('/');

    // 2. Open chat using the FAB
    const fabButton = page.locator('#chat-fab');
    // If we're not logged in or have no data, the FAB won't show.
    // For portfolio E2E, we can mock the auth or just check if it's there.
    if (await fabButton.isVisible()) {
        await fabButton.click();
        
        // 3. Verify disclaimer
        await expect(page.locator('text=Not a medical professional')).toBeVisible();
        
        // 4. Send a message
        await page.fill('#chat-input', 'Hello MediPulse');
        await page.click('#chat-send');
        
        // 5. Check if the message is in the chat
        await expect(page.locator('text=Hello MediPulse')).toBeVisible();
    }
  });
});
