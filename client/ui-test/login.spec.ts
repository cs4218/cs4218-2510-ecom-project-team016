import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
});

test.describe("Login", () => {
  test("successful login navigates to home page with user profile", async ({
    page,
  }) => {
    const email = page.getByPlaceholder("Enter Your Email");
    const password = page.getByPlaceholder("Enter Your Password");
    const button = page.getByRole("button", { name: "LOGIN" });

    await email.fill("testuser@gmail.com");
    await password.fill("t3stp@ssword");
    await button.click();

    const toast = page.getByRole("status");
    await expect(toast).toContainText("login successfully");

    await page.waitForURL("/");

    const userDropdown = page.getByRole("button", { name: "testuser" });
    expect(userDropdown).toBeDefined();
  });
});
