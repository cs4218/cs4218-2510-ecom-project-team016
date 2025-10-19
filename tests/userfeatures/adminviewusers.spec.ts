import { test, expect } from '@playwright/test';

test('adminviewuserstest', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@test.sg');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin@test.sg');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: 'admin@test.sg' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- heading "Admin Panel" [level=4]`);
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Create Category"`);
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Create Product"`);
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Products"`);
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Orders"`);
  await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Users"`);
  await page.getByRole('link', { name: 'Users' }).click();
  await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "All Users" [level=1]`);
});