// These tests were initially generated using the CodeGen AI tool.
// They were subsequently refactored and improved with ChatGPT assistance
// to include a reusable functions and more flexible testing.
// All tests have been manually reviewed to ensure correctness and to verify that they cover the intended features.
import { test, expect, Page } from '@playwright/test';


test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// -----------------------------
// Helper Functions
// -----------------------------
async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('main')).toHaveText(/login successfully/);
}

async function navigateToProfile(page: Page, username: string) {
  const userButton = page.locator('a[role="button"][data-bs-toggle="dropdown"]');
  await userButton.click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeVisible();
  await expect(page.getByText('USER PROFILEUPDATE')).toBeVisible();
}

async function updateProfileField(
  page: Page,
  fieldName: string,
  value: string,
  expectedStatus: string
) {
  const field = page.getByRole('textbox', { name: fieldName });
  await field.click();
  await field.fill(value);
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await expect(page.getByRole('main')).toHaveText(new RegExp(expectedStatus));
}

test.describe("Profile", () => {
  // -----------------------------
  // Test 1: Password update - invalid input
  // -----------------------------
  test('Password update invalid input', async ({ page }) => {
    await login(page, 'test@gmail.com', 'test@gmail.com');
    await navigateToProfile(page, 'test@gmail.com');

    // Test invalid password
    await updateProfileField(page, 'Enter Your Password', 'hello', 'Passsword is required and 6 character long');
  });

  // -----------------------------
  // Test 2: Password update - valid input
  // -----------------------------
  test('Password update valid input', async ({ page }) => {
    await login(page, 'test@gmail.com', 'test@gmail.com');
    await navigateToProfile(page, 'test@gmail.com');

    // Test valid password update
    await updateProfileField(page, 'Enter Your Password', 'hello123', 'Profile Updated Successfully');

    // Clean up: revert password back to original
    await updateProfileField(page, 'Enter Your Password', 'test@gmail.com', 'Profile Updated Successfully');
  });

  // -----------------------------
  // Test 3: Name update
  // -----------------------------
  test('Name update', async ({ page }) => {
    await login(page, 'test@gmail.com', 'test@gmail.com');
    await navigateToProfile(page, 'test@gmail.com');
    // Test valid name update
    await updateProfileField(page, 'Enter Your Name', 'test-username', 'Profile Updated Successfully');

    // Clean up: revert password back to original
    await updateProfileField(page, 'Enter Your Name', 'test@gmail.com', 'Profile Updated Successfully');
  });

  // -----------------------------
  // Test 4: Phone update
  // -----------------------------
  test('Phone update', async ({ page }) => {
    await login(page, 'test@gmail.com', 'test@gmail.com');
    await navigateToProfile(page, 'test@gmail.com');
    await updateProfileField(page, 'Enter Your Phone', '12345678', 'Profile Updated Successfully');

    // Clean up: revert phone back to original
    await updateProfileField(page, 'Enter Your Phone', 'test@gmail.com', 'Profile Updated Successfully');
  });

  // -----------------------------
  // Test 5: Address update
  // -----------------------------
  test('Address update', async ({ page }) => {
    await login(page, 'test@gmail.com', 'test@gmail.com');
    await navigateToProfile(page, 'test@gmail.com');
    await updateProfileField(page, 'Enter Your Address', '12345678', 'Profile Updated Successfully');

    // Clean up: revert address back to original
    await updateProfileField(page, 'Enter Your Address', 'test@gmail.com', 'Profile Updated Successfully');
  });

});