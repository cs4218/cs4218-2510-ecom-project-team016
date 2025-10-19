// These tests were initially generated using the CodeGen AI tool.
// They were subsequently refactored and improved with ChatGPT assistance
// to include a reusable functions and more flexible testing.
// All tests have been manually reviewed to ensure correctness and to verify that they cover the intended features.
import { test, expect, Page } from '@playwright/test';

// -----------------------------
// Helpers: login and navigate to orders
// -----------------------------
async function login(page : Page, email : string, password : string) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - text: 🙏
    - status: login successfully
  `);
}

async function goToOrders(page : Page, username : string) {
  await page.getByRole('button', { name: username }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();
}

// -----------------------------
// TEST 1: User can view orders
// -----------------------------
test('login to user to view orders', async ({ page }) => {
  await login(page, 'cs4218@test.com', 'cs4218@test.com');
  await goToOrders(page, 'CS 4218 Test Account');

  const main = page.getByRole('main');


  const expectedOrders = [
    { name: 'NUS T-shirt', description: 'Plain NUS T-shirt for sale', pricePattern: '\\d+\\.\\d+' },
    { name: 'Laptop', description: 'A powerful laptop', pricePattern: '\\d+\\.\\d+' }
  ];
  
  for (const order of expectedOrders) {
    // Check product name
    await expect(main.locator(`text=${order.name}`)).toBeVisible();
    // Check product description
    await expect(main.locator(`text=${order.description}`)).toBeVisible();
    // Check price (regex)
    await expect(main.locator(`text=Price :`)).toHaveText(new RegExp(`Price : ${order.pricePattern}`));
  }

});


// -----------------------------
// TEST 2: User has no orders
// -----------------------------
test('orders are empty', async ({ page }) => {
  await login(page, 'test@gmail.com', 'test@gmail.com');
  await goToOrders(page, 'test@gmail.com');

  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "All Orders" [level=1]`);
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- paragraph: No orders found`);
});