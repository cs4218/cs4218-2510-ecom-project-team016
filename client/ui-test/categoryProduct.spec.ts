import { test, expect } from "@playwright/test";

test.describe("Category Product E2E", () => {
  test("displays products when category has items", async ({ page }) => {
    // Navigate to a category that has products (e.g., Electronics)
    await page.goto("/category/electronics");

    // Verify category name is shown
    await expect(page.getByText(/Category - Electronics/i)).toBeVisible();

    // Verify results count is greater than 0
    await expect(page.getByText(/\d+ result found/i)).toBeVisible();

    // Verify at least one product card is displayed
    const productCards = page.locator(".card");
    await expect(productCards.first()).toBeVisible();

    // Verify "More Details" button exists
    await expect(page.getByRole("button", { name: /More Details/i }).first()).toBeVisible();
  });

  test("displays 0 results when category has no products", async ({ page }) => {
    // Navigate to a category with no products (or one that doesn't exist)
    await page.goto("/category/empty-category");

    // Verify "0 result found" message
    await expect(page.getByText(/0 result found/i)).toBeVisible();

    // Verify no product cards are displayed
    const productCards = page.locator(".card");
    await expect(productCards).toHaveCount(0);
  });
});
