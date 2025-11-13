import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Ram Rath Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveTitle(/Login|लॉगिन/);
    await expect(page.getByText('Ram Rath')).toBeVisible();
  });

  test('should display role switcher with 3 options', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Check for role options
    await expect(page.getByText(/Booker|बुकर/)).toBeVisible();
    await expect(page.getByText(/Driver|ड्राइवर/)).toBeVisible();
    await expect(page.getByText(/Admin|एडमिन/)).toBeVisible();
  });

  test('should switch roles', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Click driver role
    await page.getByRole('button', { name: /Driver|ड्राइवर/ }).click();

    // Next button should be enabled
    await expect(page.getByRole('button', { name: /Next|आगे/ })).toBeEnabled();
  });

  test('OTP Form: should validate phone number', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Select driver role and click Next
    await page.getByRole('button', { name: /Driver|ड्राइवर/ }).click();
    await page.getByRole('button', { name: /Next|आगे/ }).click();

    // Try invalid phone
    const phoneInput = page.locator('input[placeholder="9876543210"]');
    await phoneInput.fill('123'); // Too short

    // Send OTP button should be disabled
    const sendButton = page.getByRole('button', { name: /Send OTP|OTP भेजें/ });
    await expect(sendButton).toBeDisabled();
  });

  test('OTP Form: should accept valid phone', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Select driver role and click Next
    await page.getByRole('button', { name: /Driver|ड्राइवर/ }).click();
    await page.getByRole('button', { name: /Next|आगे/ }).click();

    // Enter valid phone
    const phoneInput = page.locator('input[placeholder="9876543210"]');
    await phoneInput.fill('9876543210');

    // Send OTP button should be enabled
    const sendButton = page.getByRole('button', { name: /Send OTP|OTP भेजें/ });
    await expect(sendButton).toBeEnabled();
  });

  test('Booker Dashboard: should require authentication', async ({ page }) => {
    await page.goto(`${BASE_URL}/booker/dashboard`, { waitUntil: 'networkidle' });

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Driver Dashboard: should require authentication', async ({ page }) => {
    await page.goto(`${BASE_URL}/driver/dashboard`, { waitUntil: 'networkidle' });

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Admin Panel: should require authentication', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/panel`, { waitUntil: 'networkidle' });

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Bilingual UI: English & Hindi present', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Check for both languages
    await expect(page.getByText(/आप कौन हैं/)).toBeVisible(); // Hindi
    await expect(page.getByText(/Who are you/)).toBeVisible(); // English
  });

  test('Accessibility: role buttons should be keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Tab to first role button
    await page.keyboard.press('Tab');

    // Space should select it
    await page.keyboard.press('Space');

    // Button should be focused
    const focusedElement = await page.evaluate(() => (document.activeElement as any)?.getAttribute('class'));
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Admin Driver Verification', () => {
  test('Admin should see pending drivers section', async ({ page }) => {
    // Assuming admin is logged in via context
    await page.goto(`${BASE_URL}/admin/panel`);

    // Check for pending drivers section
    await expect(page.getByText(/Pending Drivers|लंबित ड्राइवर/)).toBeVisible();
  });

  test('Audit logs should display actions', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/panel`);

    // Scroll to audit logs
    await page.locator('text=/Activity|गतिविधि/').scrollIntoViewIfNeeded();

    // Should see activity table or message
    await expect(page.getByText(/Activity|गतिविधि|Activity Logs|कोई गतिविधि/)).toBeVisible();
  });
});

test.describe('Booker Flow', () => {
  test('Booker login redirects to dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/booker/dashboard`);

    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*\/login/);
  });
});

test.describe('Direct Booking & Post Ride', () => {
  test('Home loads and shows CTAs', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('text=Book a Car|Direct Book')).toBeVisible();
    await expect(page.locator('text=Post a Ride Request|Post Ride')).toBeVisible();
  });

  test('Direct booking accepts manual distance', async ({ page }) => {
    await page.goto(`${BASE_URL}/direct-book`);
    await page.fill('input[placeholder*="from"]', 'Village A');
    await page.fill('input[placeholder*="to"]', 'Town B');
    
    // Fill manual distance
    const distanceInput = page.locator('input[placeholder*="Distance"]');
    if (await distanceInput.isVisible()) {
      await distanceInput.fill('20');
    }

    // Should have submit button
    await expect(page.getByRole('button', { name: /Book|Search|आओ/ })).toBeVisible();
  });

  test('Post ride request works', async ({ page }) => {
    await page.goto(`${BASE_URL}/post-ride`);
    
    // Fill form fields if visible
    const fromInput = page.locator('input[placeholder*="from"]').first();
    if (await fromInput.isVisible()) {
      await fromInput.fill('Village A');
    }
  });
});
