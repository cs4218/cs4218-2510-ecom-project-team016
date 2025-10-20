import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/forgot-password");
});

test.describe("Forget", () => {
  const TEST_PASSWORD = "t3stp@ssword";
  const CHANGED_PASSWORD = "changed_p@ssword123";

  test("forget form shows all expected fields", async ({ page }) => {
    await expect(page.getByPlaceholder("Enter Your Email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter Your Answer")).toBeVisible();
    await expect(page.getByPlaceholder("Enter New Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "RESET PASSWORD" })
    ).toBeVisible();
  });

  test("forget form fields have expected value on fill", async ({ page }) => {
    const sample = {
      email: `forgot${Date.now()}@example.com`,
      answer: "blue",
      password: TEST_PASSWORD,
    };

    page.on("requestfailed", (request) => {
      console.log(
        "REQUEST FAILED:",
        request.url(),
        request.failure()?.errorText
      );
    });

    await page.getByPlaceholder("Enter Your Email").fill(sample.email);
    await page.getByPlaceholder("Enter Your Answer").fill(sample.answer);
    const passwordField = page.getByPlaceholder("Enter New Password");
    await passwordField.fill(sample.password);

    await expect(page.getByPlaceholder("Enter Your Email")).toHaveValue(
      sample.email
    );
    await expect(page.getByPlaceholder("Enter Your Answer")).toHaveValue(
      sample.answer
    );
    await expect(passwordField).toHaveValue(sample.password);

    await expect(passwordField).toHaveAttribute("type", "password");
    await expect(page.locator(`text=${sample.password}`)).toHaveCount(0);
  });

  test("forget password successful", async ({ page }) => {
    // register a fake user
    await page.goto("/register");
    const timestamp = Date.now();
    const uniqueEmail = `newuser${timestamp}@gmail.com`;
    const testName = `New User ${timestamp}`;

    await page.getByPlaceholder("Enter Your Name").fill(testName);
    await page.getByPlaceholder("Enter Your Email").fill(uniqueEmail);
    await page.getByPlaceholder("Enter Your Password").fill(TEST_PASSWORD);
    await page.getByPlaceholder("Enter Your Phone").fill("9876543210");
    await page.getByPlaceholder("Enter Your Address").fill("456 New Street");
    await page.locator('input[type="Date"]').fill("1995-05-15");
    await page
      .getByPlaceholder("What is Your Favorite sports")
      .fill("Basketball");

    const registerResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/v1/auth/register")
    );

    await page.getByRole("button", { name: "REGISTER" }).click();

    // Verify registration succeeded
    const registerResponse = await registerResponsePromise;
    const registerBody = await registerResponse.json();
    expect(registerBody.success).toBe(true);

    // check if user can login
    await page.goto("/login");
    await page.getByPlaceholder("Enter Your Email").fill(uniqueEmail);
    await page.getByPlaceholder("Enter Your Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "LOGIN" }).click();

    const toast = page.getByRole("status");
    await expect(toast).toContainText("login successfully");

    // logout
    const dropDown = page.getByRole("button", { name: testName.toUpperCase() });
    await dropDown.click();
    const logout = page.getByRole("link", { name: "LOGOUT" });
    await logout.click();

    await page.goto("/forgot-password");

    // reset password
    await page.getByPlaceholder("Enter Your Email").fill(uniqueEmail);
    await page.getByPlaceholder("Enter Your Answer").fill("Basketball");
    const passwordField = page.getByPlaceholder("Enter New Password");
    await passwordField.fill(CHANGED_PASSWORD);
    const resetButton = page.getByRole("button", { name: "RESET PASSWORD" });
    await resetButton.click();

    const status = page.getByRole("status");
    await expect(status).toContainText("Password reset successfully");

    // navigate to login and test login
    await page.goto("/login");
    await page.getByPlaceholder("Enter Your Email").fill(uniqueEmail);
    await page.getByPlaceholder("Enter Your Password").fill(CHANGED_PASSWORD);
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(toast).toContainText("login successfully");
  });

  test("invalid email unsuccessful forget password change", async ({
    page,
  }) => {
    await page
      .getByPlaceholder("Enter Your Email")
      .fill("invalidemail@gmail.com");
    await page.getByPlaceholder("Enter Your Answer").fill("Basketball");
    const passwordField = page.getByPlaceholder("Enter New Password");
    await passwordField.fill(CHANGED_PASSWORD);
    const resetButton = page.getByRole("button", { name: "RESET PASSWORD" });
    await resetButton.click();

    const toast = page.getByRole("status");
    await expect(toast).toContainText("Wrong Email Or Answer");
  });
});
