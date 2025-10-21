import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
});

test.describe("Login", () => {
  test("login page loads with the correct UI form fields", async ({ page }) => {
    const email = page.getByPlaceholder("Enter Your Email");
    const password = page.getByPlaceholder("Enter Your Password");
    const loginButton = page.getByRole("button", { name: "LOGIN" });
    const forgetButton = page.getByRole("button", { name: "Forgot Password" });

    expect(email).toBeVisible();
    expect(password).toBeVisible();
    expect(loginButton).toBeVisible();
    expect(forgetButton).toBeVisible();
  });

  test("login page form fields to display with correct information when filled", async ({
    page,
  }) => {
    const email = page.getByPlaceholder("Enter Your Email");
    const password = page.getByPlaceholder("Enter Your Password");

    await email.fill("testuser123@gmail.com");
    await password.fill("t3stp@ssword");

    expect(email).toHaveValue("testuser123@gmail.com");

    // checks if password is hidden
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveValue("t3stp@ssword");
    await expect(page.locator(`text=t3stp@ssword`)).toHaveCount(0);
  });

  test("successful login navigates to home page with user profile", async ({
    page,
  }) => {
    const email = page.getByPlaceholder("Enter Your Email");
    const password = page.getByPlaceholder("Enter Your Password");
    const button = page.getByRole("button", { name: "LOGIN" });

    await email.fill("testuser123@gmail.com");
    await password.fill("t3stp@ssword");
    await button.click();

    const toast = page.getByRole("status");
    await expect(toast).toContainText("login successfully");

    await page.waitForURL("/");

    const userDropdown = page.getByRole("button", { name: "testuser123" });
    expect(userDropdown).toBeDefined();
  });

  test("Unsuccessful login fails due to invalid credentials. Displays error toast", async ({
    page,
  }) => {
    const email = page.getByPlaceholder("Enter Your Email");
    const password = page.getByPlaceholder("Enter Your Password");
    const button = page.getByRole("button", { name: "LOGIN" });

    await email.fill("invaliduser123@gmail.com");
    await password.fill("invalidp@ssword");
    await button.click();

    const toast = page.getByRole("status");
    await expect(toast).toContainText("Something went wrong");
  });

  test("Click on forget password navigates to forget pages", async ({
    page,
  }) => {
    const forgetButton = page.getByRole("button", { name: "Forgot Password" });

    await forgetButton.click();

    await page.waitForURL("/forgot-password");
  });
});
