import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/register");
});

test.describe("Register", () => {
  const TEST_PASSWORD = "t3stp@ssword";
  test("registration form shows all expected fields", async ({ page }) => {
    await expect(page.getByPlaceholder("Enter Your Name")).toBeVisible();
    await expect(page.getByPlaceholder("Enter Your Email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter Your Password")).toBeVisible();
    await expect(page.getByPlaceholder("Enter Your Phone")).toBeVisible();
    await expect(page.getByPlaceholder("Enter Your Address")).toBeVisible();
    await expect(
      page.getByPlaceholder("What is Your Favorite sports")
    ).toBeVisible();
    await expect(page.locator('input[type="Date"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "REGISTER" })).toBeVisible();
  });

  test("registration form fields have expected value on fill", async ({
    page,
  }) => {
    const sample = {
      name: "Jane Doe",
      email: "janedoe@example.com",
      password: TEST_PASSWORD,
      phone: "5551234567",
      address: "10 Downing St",
      dob: "1990-12-31",
      answer: "Tennis",
    };

    await page.getByPlaceholder("Enter Your Name").fill(sample.name);
    await page.getByPlaceholder("Enter Your Email").fill(sample.email);
    const passwordField = page.getByPlaceholder("Enter Your Password");
    await passwordField.fill(sample.password);
    await page.getByPlaceholder("Enter Your Phone").fill(sample.phone);
    await page.getByPlaceholder("Enter Your Address").fill(sample.address);
    await page.locator('input[type="Date"]').fill(sample.dob);
    await page
      .getByPlaceholder("What is Your Favorite sports")
      .fill(sample.answer);

    await expect(page.getByPlaceholder("Enter Your Name")).toHaveValue(
      sample.name
    );
    await expect(page.getByPlaceholder("Enter Your Email")).toHaveValue(
      sample.email
    );
    await expect(passwordField).toHaveValue(sample.password);
    await expect(page.getByPlaceholder("Enter Your Phone")).toHaveValue(
      sample.phone
    );
    await expect(page.getByPlaceholder("Enter Your Address")).toHaveValue(
      sample.address
    );
    await expect(page.locator('input[type="Date"]')).toHaveValue(sample.dob);
    await expect(
      page.getByPlaceholder("What is Your Favorite sports")
    ).toHaveValue(sample.answer);

    await expect(passwordField).toHaveAttribute("type", "password");
    await expect(page.locator(`text=${sample.password}`)).toHaveCount(0);
  });

  test("successful registration and login flow", async ({ page }) => {
    // Generate unique credentials
    const timestamp = Date.now();
    const uniqueEmail = `newuser${timestamp}@gmail.com`;
    const testName = `New User ${timestamp}`;

    // Monitor failed requests
    page.on("requestfailed", (request) => {
      console.log("❌ Request Failed:", request.url());
      console.log("   Error:", request.failure()?.errorText);
    });

    // Fill in registration form
    await page.getByPlaceholder("Enter Your Name").fill(testName);
    await page.getByPlaceholder("Enter Your Email").fill(uniqueEmail);
    await page.getByPlaceholder("Enter Your Password").fill(TEST_PASSWORD);
    await page.getByPlaceholder("Enter Your Phone").fill("9876543210");
    await page.getByPlaceholder("Enter Your Address").fill("456 New Street");
    await page.locator('input[type="Date"]').fill("1995-05-15");
    await page
      .getByPlaceholder("What is Your Favorite sports")
      .fill("Basketball");

    // Submit registration
    const registerResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/v1/auth/register")
    );

    await page.getByRole("button", { name: "REGISTER" }).click();

    // Verify registration succeeded
    const registerResponse = await registerResponsePromise;
    const registerBody = await registerResponse.json();
    expect(registerBody.success).toBe(true);

    // Should be redirected to login page
    await page.waitForURL("/login");

    // Now login with the newly created account
    await page.getByPlaceholder("Enter Your Email").fill(uniqueEmail);
    await page.getByPlaceholder("Enter Your Password").fill(TEST_PASSWORD);

    const loginResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/v1/auth/login")
    );

    await page.getByRole("button", { name: "LOGIN" }).click();

    // Verify login succeeded
    const loginResponse = await loginResponsePromise;
    const loginBody = await loginResponse.json();

    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("login successfully");

    // Wait for navigation to home page
    await page.waitForURL("/", { timeout: 10000 });

    // Extract first name from full name for dropdown verification
    const firstName = testName.split(" ")[0];

    // Verify user dropdown is visible with correct name
    const userDropdown = page.getByRole("button", { name: firstName });
    await expect(userDropdown).toBeVisible();

    console.log("✅ Full registration and login flow successful!");
  });

  test("registration with existing email shows error", async ({ page }) => {
    const existingEmail = "testuser@gmail.com";

    await page.getByPlaceholder("Enter Your Name").fill("Test User");
    await page.getByPlaceholder("Enter Your Email").fill(existingEmail);
    await page.getByPlaceholder("Enter Your Password").fill(TEST_PASSWORD);
    await page.getByPlaceholder("Enter Your Phone").fill("1234567890");
    await page.getByPlaceholder("Enter Your Address").fill("123 Test Street");
    await page.locator('input[type="Date"]').fill("1990-01-01");
    await page.getByPlaceholder("What is Your Favorite sports").fill("Soccer");

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/v1/auth/register")
    );

    await page.getByRole("button", { name: "REGISTER" }).click();

    const response = await responsePromise;
    const responseBody = await response.json();

    console.log("Duplicate Registration Response:", responseBody);

    // Should return 409 (Conflict) for existing user
    expect(response.status()).toBe(409);
    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toBe("Already Register please login");

    const toast = page.getByRole("status");
    await expect(toast).toContainText("Something went wrong");

    // Should stay on registration page
    expect(page.url()).toContain("/register");
  });
});
