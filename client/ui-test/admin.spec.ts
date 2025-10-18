// This was generated using CodeGen and edited by chatgpt for readability

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { UUID } from "mongodb";
import path from 'path';

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function login(page: Page) {
    await page.goto("/login");
    const newEmail = page.getByPlaceholder("Enter Your Email");

    await newEmail.fill("a@a.sg");
    await page.getByPlaceholder("Enter Your Password").fill("lllll");

    await page.getByRole("button", { name: "Login" }).click();
}

test.describe("Admin", () => {
  test("should allow me to login as admin and view the dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/");
  });

  test("should allow me to create a new category and create a new product with it", async ({ page }) => {
      // Log in
    await login(page);

    // Navigate to Dashboard → Create Category
    await page.getByRole('button', { name: 'aaa' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();

    // Fill in and submit new category
    const categoryName = 'NewCat';
    const categoryInput = page.getByRole('textbox', { name: 'Enter new category' });
    await categoryInput.click();
    await categoryInput.fill(categoryName);
    await page.getByRole('button', { name: 'Submit' }).click();

    const productDescription = 'Product Description';
    const productName = new UUID().toString();
    const productPrice = '50';
    const productQuantity = '1';
    const productImage = path.resolve(__dirname, './public/1mb.png');

    // Navigate to Create Product
    await page.getByRole('link', { name: 'Create Product' }).click();

    // Select category
    await page.locator('#rc_select_0').click();
    await page.getByTitle(categoryName).locator('div').click();

    // Upload product photo
    await page.getByText('Upload Photo').click();
    const input = page.locator('#test-upload-photo');
    await input.setInputFiles(productImage);

    // Fill in product details
    await page.getByRole('textbox', { name: 'write a name' }).fill(productName);
    await page.getByRole('textbox', { name: 'write a description' }).fill(productDescription);
    await page.getByPlaceholder('write a price').fill(productPrice);
    await page.getByPlaceholder('write a quantity').fill(productQuantity);

    // Select featured option
    await page.locator('#rc_select_1').click();
    await page.getByText('Yes').click();

    // Submit
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

    // Verify the product appears in the products list
    await page.waitForURL(/.*\/admin\/products/);
    await expect(page.getByRole('link', { name: productName + ' ' + productName})).toBeVisible();

    // Cleanup: delete the created product
    await page.getByRole('button', { name: 'aaa' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: productName + ' ' + productName }).click();

    // wait for 1 second to ensure page is loaded
    await page.waitForTimeout(1000);
  
    page.once('dialog', async (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept(); // clicks OK
    });
    await page.locator('#delete-button').click();

    // Verify deletion
    await page.getByRole('link', { name: 'Products' }).click();
    await page.waitForURL(/.*\/admin\/products/);
    // wait for 1 second to ensure page is loaded
    await page.waitForTimeout(1000);
    await expect(page.getByText("All Products List")).toBeVisible();
    await expect(page.getByRole('link', { name: productName + ' ' + productName })).not.toBeVisible();
  });

  test("should allow me to view orders in the admin dashboard", async ({ page }) => {
    // Log in
    await login(page);

    // Create a new order
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('radio', { name: '$100 or' }).check();
    await page.locator('#add-to-cart-button-Smartphone').click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Paying with Card' }).click();

    // Fill in payment details
    await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill('0126');
    await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).fill('123');
    await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill('4111111111111111');
    await page.getByRole('button', { name: 'Make Payment' }).click();

    // View the order in the admin dashboard
    await page.getByRole('button', { name: 'aaa' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();

    // Verify order details
    await expect(page.getByRole('main')).toContainText('Not Process');

    // Click the first matching cell
    await page.getByRole('cell', { name: 'aaa' }).first().click();

    // Verify the details on the main section
    await expect(page.getByRole('main')).toContainText('aaa');
    await expect(page.getByRole('main')).toContainText('a few seconds ago');
    await expect(page.getByRole('main')).toContainText('Success');
    await expect(page.getByRole('main')).toContainText('NUS T-shirtPlain NUS T-shirt for salePrice : 4.99');
  });
});
