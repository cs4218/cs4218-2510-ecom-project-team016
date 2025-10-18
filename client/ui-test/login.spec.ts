import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
});

test.describe("Login", () => {
  test("should allow me to fill in login fields", async ({ page }) => {
    const newEmail = page.getByPlaceholder("Enter Your Email");

    await newEmail.fill("Hello");

    console.log("done");
    // await newEmail.fill("validemail@gmail.com");
  });
});
