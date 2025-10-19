// These tests were initially generated using the CodeGen AI tool.
// They were subsequently refactored and improved with ChatGPT assistance
// to include a reusable functions and more flexible testing.
// All tests have been manually reviewed to ensure correctness and to verify that they cover the intended features.
import { test, expect, Page } from '@playwright/test';

// -----------------------------
// Helper: login as admin
// -----------------------------
async function loginAsAdmin(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@test.sg');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin@test.sg');
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Assertion: ensure login succeeded
  await expect(page.getByRole('main')).toContainText('login successfully');
}


// -----------------------------
// TEST 1: View Users Dashboard
// -----------------------------
test('admin can view user dashboard and users list', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to admin dashboard
  await page.getByRole('button', { name: 'admin@test.sg' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('heading', { name: /Admin Panel/i })).toBeVisible();

  // Verify sidebar/dashboard links
  const expectedLinks = ['Create Category', 'Create Product', 'Products', 'Orders', 'Users'];
  for (const linkText of expectedLinks) {
    await expect(page.getByRole('link', { name: linkText })).toBeVisible();
  }

  // Navigate to Users page
  await page.getByRole('link', { name: 'Users' }).click();
  await expect(page.getByRole('heading', { name: /All Users/i })).toBeVisible();
});


// -----------------------------
// TEST 2: View All Orders
// -----------------------------
test('admin views all orders', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to Orders
  await page.getByRole('button', { name: 'admin@test.sg' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();

  await expect(page.getByRole('heading', { name: /All Orders/i })).toBeVisible();

  // Wait for at least one order to render
  await page.waitForSelector('table tbody tr', { timeout: 10000 });

  const orderCount = await page.locator('table tbody tr').count();
  expect(orderCount).toBeGreaterThan(0);

  // Check that the first order has valid status text
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toContainText(/Success|Failed|Pending/);

  // Now check for product info in the same order card
  const firstOrder = page.locator('.border.shadow').first();
  await expect(firstOrder.locator('p', { hasText: 'Price' }).first()).toHaveText(/Price/i);
});

// -----------------------------
// TEST 3: Update Order Status
// -----------------------------
test('admin updates an order status', async ({ page }) => {
  await loginAsAdmin(page);

  // Navigate to Orders page
  await page.getByRole('button', { name: 'admin@test.sg' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('heading', { name: /All Orders/i })).toBeVisible();

  // Wait for orders table
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  const orderCount = await page.locator('table tbody tr').count();
  expect(orderCount).toBeGreaterThan(0);

  // Click first order's status dropdown
  const statusDropdown = page.locator('.ant-select-selector').first();
  await statusDropdown.click();

  // Click "Shipped" option from portal dropdown
  const shippedOption = page.locator('.ant-select-dropdown .ant-select-item-option-content', {
    hasText: 'Shipped',
  });
  await shippedOption.click();

  // Check Toast notification for success
  await expect(page.getByRole('main')).toContainText('Status Updated');
});
