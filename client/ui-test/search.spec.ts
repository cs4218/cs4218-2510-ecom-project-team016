import { test, expect } from "@playwright/test";

test.describe("Search E2E", () => {
  test("can type in search input and submit", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Search");
    await searchInput.fill("laptop");

    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/\/search/);
  });

  test("displays search results after searching", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Search").fill("novel");
    await page.getByRole("button", { name: "Search" }).click();

    await page.waitForURL(/\/search/);

    await expect(page.getByRole("heading", { name: /Search Resuts/i })).toBeVisible();
    await expect(page.getByText(/Found \d+/i)).toBeVisible();
  });

  test("can submit search by pressing Enter", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Search");
    await searchInput.fill("tablet");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/search/);
  });

  test("search input maintains value after typing", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Search");
    const searchTerm = "headphones";

    await searchInput.fill(searchTerm);

    await expect(searchInput).toHaveValue(searchTerm);
  });
});
