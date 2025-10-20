import { test, expect, Page, Locator } from '@playwright/test';

const TEST_USER = {
  name: 'alyssa',
  email: 'alyssa@test.com',
  password: 'alyssa@test.com',
  phone: '91234567',
  address: 'Some Address',
  dob: '2025-10-07',
  favSport: 'football',
};

const EXISTING_USER = {
  name: 'CS 4218 Test Account',
  email: 'cs4218@test.com',
  password: 'cs4218@test.com',
  phone: '81234567',
  address: '1 Computing Drive',
  dob: '2025-10-07',
  favSport: 'cs4218@test.com',
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// -----------------------------
// Helper Functions
// -----------------------------
async function registerUser(page: Page, user = TEST_USER) {
  await page.goto('/register');
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(user.name);
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(user.phone);
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(user.address);
  await page.getByPlaceholder('Enter Your DOB').fill(user.dob);
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(user.favSport);
  await page.getByRole('button', { name: 'REGISTER' }).click();
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('main')).toHaveText(/login successfully/);
}

async function navigateToOrders(page: Page, username: string) {
  const userButton = page.getByRole('button', { name: username });
  await userButton.click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();
}

async function ensureUserExists(page: Page, user = TEST_USER) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(user.email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(user.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  if (await page.getByText('Something went wrong').isVisible()) {
    await registerUser(page, user); // only register if login failed
  }
}

// -----------------------------
// TEST SUITE: Orders
// -----------------------------
test.describe('Orders', () => {

  // 1️ Test: User has no orders
  test('user with no orders sees empty message', async ({ page }) => {
    await ensureUserExists(page, TEST_USER);
    await login(page, TEST_USER.email, TEST_USER.password); // Login
    await navigateToOrders(page, TEST_USER.name); // Navigate

    await expect(page.locator('h1')).toHaveText('All Orders');
    await expect(page.getByText('No orders found')).toBeVisible();
  });

  // 2️ Test: User can place order and view it
  test('user can place an order and view it in orders page', async ({ page }) => {
    await ensureUserExists(page, EXISTING_USER);
    await login(page, EXISTING_USER.email, EXISTING_USER.password);

    // Add to cart & pay
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('radio', { name: '$100 or' }).check();
    await page.locator('#add-to-cart-button-Smartphone').click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Paying with Card' }).click();

    // Fill payment iframe
    await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill('0126');
    await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).fill('123');
    await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill('4111111111111111');
    await page.getByRole('button', { name: 'Make Payment' }).click();

    // Verify order
    await page.waitForURL(/.*\/user\/orders/);
    const main = page.getByRole('main');

    await expect(main.getByText('Smartphone').first()).toBeVisible();
    await expect(main.getByText(/Price : \d+\.\d+/).first()).toBeVisible();
  });
});
