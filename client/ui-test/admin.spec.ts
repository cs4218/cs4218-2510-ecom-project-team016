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
  // p0
  test("should allow me to login as admin and view the dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL("/");
    await navigateToAdminDashboard(page);
    await expect(page).toHaveURL(/.*\/dashboard\/admin/);
    await expect(page.getByRole("heading", { name: "Admin Panel" })).toBeVisible();
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
    await navigateToAdminDashboard(page);
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

  test("should allow me to view and manage orders in the admin dashboard", async ({ page }) => {
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
    
    // wait to be directed to user/orders
    await page.waitForURL(/.*\/user\/orders/);

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
    await expect(page.getByRole('main')).toContainText('Smartphone');

    // Update order status
    await page.getByText('Not Process').first().click();
    await page.getByTitle('Processing').first().click();

    // Verify status update
    await expect(page.getByRole('main')).toContainText('Processing');
  });

  // p1
  test('should allow me to create, update, and delete categories in the admin dashboard', async ({ page }) => {
    // Log in
    await login(page);

    // Navigate to Dashboard → Create Category
    await page.getByRole('button', { name: 'aaa' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();

    // Fill in and submit new category
    const categoryName = 'TestCategory';
    const categoryInput = page.getByRole('textbox', { name: 'Enter new category' });
    await categoryInput.click();
    await categoryInput.fill(categoryName);
    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify category creation
    await expect(page.getByRole('cell', { name: categoryName })).toBeVisible(); // once in list, once in edit section

    // Update the category
    const updatedCategoryName = 'UpdatedCategory';
    const updateInput = page.locator(`#edit-button-${categoryName}`);
    await updateInput.click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill(updatedCategoryName);
    await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

    // Verify category update
    await expect(page.getByRole('cell', { name: updatedCategoryName })).toBeVisible();
    
    // Delete the category
    await page.locator(`#delete-button-${updatedCategoryName}`).click();

    // Verify category deletion
    await expect(page.getByRole('cell', { name: updatedCategoryName })).not.toBeVisible();
  });

  test('should allow me to create, edit and delete products in the admin dashboard', async ({ page }) => {
    // Log in
    await login(page);
    await navigateToAdminDashboard(page);
    await page.getByRole('link', { name: 'Create Product' }).click();

    const categoryName = 'Electronics';
    const productDescription = 'Product Description';
    const productName = new UUID().toString();
    const productPrice = '50';
    const productQuantity = '1';
    const productImage = path.resolve(__dirname, './public/1mb.png');

    // Select category
    await page.locator('div').filter({ hasText: /^Select a category$/ }).first().click();
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

    // Update the created product
    await page.waitForURL(/.*\/admin\/products/);
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: productName + ' ' + productName }).click();

    // wait 1 second to ensure page is loaded
    await page.waitForTimeout(1000);

    const updatedProductName = productName + '_Updated';
    await page.getByRole('textbox', { name: 'write a name' }).fill(updatedProductName);
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

    // Delete the created product
    await page.waitForURL(/.*\/admin\/products/);
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: updatedProductName }).click();

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
    await expect(page.getByRole('link', { name: updatedProductName })).not.toBeVisible();
  });

  test('should allow me to vie users', async ({ page }) => {
    await login(page);
  
    // Navigate to admin dashboard
    await navigateToAdminDashboard(page);
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
});


async function navigateToAdminDashboard(page: Page) {
  await page.getByRole('button', { name: 'aaa' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
}