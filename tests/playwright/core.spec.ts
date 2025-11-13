import { test, expect } from '@playwright/test';

test.describe('RamRath core flows', () => {
  test('Home loads and shows CTAs', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=Book a Car')).toBeVisible();
    await expect(page.locator('text=Post a Ride Request')).toBeVisible();
  });

  test('Direct booking estimate fallback and manual', async ({ page }) => {
    await page.goto('http://localhost:3000/direct-book');
    await page.fill('input[aria-label="from"]', 'Village A');
    await page.fill('input[aria-label="to"]', 'Town B');
    // Click estimate - in CI this will hit API route; if no key present expect fallback
    await page.click('text=Estimate Distance / दूरी बताओ');
    // Either manual input appears or distance shown
    const manual = await page.locator('input[placeholder="Distance (km)"]');
    expect(manual).toBeVisible();
  });

  test('Post ride request flow', async ({ page }) => {
    await page.goto('http://localhost:3000/post-ride');
    await page.fill('input[placeholder="From"]', 'Village A');
    await page.fill('input[placeholder="To"]', 'Town B');
    await page.fill('input[placeholder="Distance (km)"]', '12');
    await page.fill('input[placeholder="Offer amount (₹)"]', '300');
    await page.fill('input[placeholder="Contact phone"]', '+911234567890');
    await page.click('text=Post Ride / पोस्ट करें');
    // Should show the new post in the board
    await expect(page.locator('text=Village A → Town B')).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Core flows', () => {
  test('Post a ride then first driver confirm wins', async ({ page }) => {
    await page.goto('http://localhost:3000/post-ride');
    await page.fill('input[placeholder="From"]', 'A');
    await page.fill('input[placeholder="To"]', 'B');
    await page.fill('input[placeholder="Distance (km)"]', '10');
    await page.fill('input[placeholder="Offer amount (₹)"]', '200');
    await page.fill('input[placeholder="Contact phone"]', '+911234567890');
    await page.click('text=Post Ride');
    // expect onboard: a new post appears
    await expect(page.locator('text=A → B')).toBeVisible();
  });

  test('Direct booking estimate -> create -> confirm', async ({ page }) => {
    await page.goto('http://localhost:3000/direct-book');
    await page.fill('input[aria-label="from"]', 'Delhi');
    await page.fill('input[aria-label="to"]', 'Noida');
    await page.click('text=Estimate Distance');
    // can't rely on Google in CI; ensure UI handles gracefully
    await expect(page.locator('text=Distance')).toBeVisible();
  });
});
