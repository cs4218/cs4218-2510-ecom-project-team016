import { test, expect } from "@playwright/test";

test.describe("Categories E2E", () => {
  test("displays categories list", async ({ page }) => {
    await page.goto("/categories");

    const categoryLinks = page.getByRole("link", { name: /Electronics|Book|Clothing/i });
    await expect(categoryLinks.first()).toBeVisible();
  });

  test("displays multiple category buttons", async ({ page }) => {
    await page.goto("/categories");

    const categoryLinks = page.getByRole("link");
    const count = await categoryLinks.count();

    expect(count).toBeGreaterThan(0);
  });

  test("category buttons have correct links", async ({ page }) => {
    await page.goto("/categories");

    const electronicsLink = page.getByRole("link", { name: "Electronics" });

    await expect(electronicsLink).toHaveAttribute("href", "/category/electronics");
  });
});
