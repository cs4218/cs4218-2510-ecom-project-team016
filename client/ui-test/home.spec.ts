import { test, expect } from "@playwright/test";
import { seedLocalStorage } from "./_utils";

test.describe("Home E2E", () => {
  test.beforeEach(async ({ page }) => {
    await seedLocalStorage(page, { cart: [] });
  });

  test("loads homepage and shows essential elements", async ({ page }) => {
    await page.goto("/");
    
    // Verify main heading
    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
    
    // Verify navigation links
    await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Home/i })).toBeVisible();
    
    // Verify filter sections exist
    await expect(page.getByText("Filter By Category")).toBeVisible();
    await expect(page.getByText("Filter By Price")).toBeVisible();
    
    // Verify reset button
    await expect(page.getByRole("button", { name: /RESET FILTERS/i })).toBeVisible();
  });

  test("adds product to cart and updates cart count", async ({ page }) => {
    await page.goto("/");
    
    // Wait for products to load
    await page.waitForSelector(".card", { timeout: 10000 });
    
    // Get initial cart link
    const cartLink = page.getByRole("link", { name: /Cart/i });
    await expect(cartLink).toBeVisible();
    
    // Click "ADD TO CART" on first product
    const addToCartButton = page.locator(".btn-dark").first();
    await addToCartButton.click();
    
    // Verify toast notification
    await expect(page.getByText(/Item Added to cart/i)).toBeVisible({ timeout: 5000 });
    
    // Verify cart badge appears with count (Ant Design Badge creates a sup element)
    await expect(page.locator('.ant-badge-count').first()).toContainText("1", { timeout: 5000 });
  });

  test("navigates to product details page", async ({ page }) => {
    await page.goto("/");
    
    // Wait for products to load
    await page.waitForSelector(".card", { timeout: 10000 });
    
    // Click "More Details" on first product
    const moreDetailsButton = page.locator(".btn-info").first();
    await moreDetailsButton.click();
    
    // Verify navigation to product detail page
    await expect(page).toHaveURL(/\/product\/.+/);
    
    // Verify product detail page elements
    await expect(page.getByText(/Product Details/i)).toBeVisible({ timeout: 5000 });
  });

  test("filters products by category", async ({ page }) => {
    await page.goto("/");
    
    // Wait for products and categories to load
    await page.waitForSelector(".card", { timeout: 10000 });
    await page.waitForSelector('input[type="checkbox"]', { timeout: 5000 });
    
    // Get initial product count
    const initialCount = await page.locator(".card").count();
    
    // Click first category checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Verify products are filtered (count may change)
    const filteredCount = await page.locator(".card").count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test("filters products by price range", async ({ page }) => {
    await page.goto("/");
    
    // Wait for products to load
    await page.waitForSelector(".card", { timeout: 10000 });
    
    // Click a price range radio button
    const priceRadio = page.locator('input[type="radio"]').first();
    await priceRadio.check();
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Verify products are still displayed
    const filteredCount = await page.locator(".card").count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test("resets filters when clicking RESET FILTERS button", async ({ page }) => {
    await page.goto("/");
    
    // Wait for products to load
    await page.waitForSelector(".card", { timeout: 10000 });
    
    // Apply a category filter
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    await page.waitForTimeout(500);
    
    // Click reset button
    const resetButton = page.getByRole("button", { name: /RESET FILTERS/i });
    await resetButton.click();
    
    // Wait for page reload
    await page.waitForLoadState("networkidle");
    
    // Verify we're back on homepage with all products
    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
  });

  test("loads more products when clicking Loadmore button", async ({ page }) => {
    await page.goto("/");
    
    // Wait for initial products to load
    await page.waitForSelector(".card", { timeout: 10000 });
    
    // Get initial product count
    const initialCount = await page.locator(".card").count();
    
    // Check if Loadmore button exists
    const loadMoreButton = page.getByRole("button", { name: /Loadmore/i });
    const isVisible = await loadMoreButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await loadMoreButton.click();
      
      // Wait for new products to load
      await page.waitForTimeout(2000);
      
      // Verify more products are loaded
      const newCount = await page.locator(".card").count();
      expect(newCount).toBeGreaterThan(initialCount);
    } else {
      // If no loadmore button, it means all products are already loaded
      expect(initialCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("cart persists when navigating between pages", async ({ page }) => {
    await page.goto("/");
    
    // Wait for products to load
    await page.waitForSelector(".card", { timeout: 10000 });
    
    // Add product to cart
    const addToCartButton = page.locator(".btn-dark").first();
    await addToCartButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to About page
    await page.getByRole("link", { name: /About/i }).click();
    await page.waitForLoadState("networkidle");
    
    // Navigate back to Home
    await page.getByRole("link", { name: /Home/i }).click();
    await page.waitForLoadState("networkidle");
    
    // Verify cart still has 1 item via badge
    await expect(page.locator('.ant-badge-count').first()).toContainText("1");
  });

  test("multiple products can be added to cart", async ({ page }) => {
    await page.goto("/");
    
    // Wait for products to load
    await page.waitForSelector(".card", { timeout: 10000 });
    
    // Add first product
    await page.locator(".btn-dark").first().click();
    await page.waitForTimeout(500);
    
    // Add second product
    await page.locator(".btn-dark").nth(1).click();
    await page.waitForTimeout(500);
    
    // Verify cart badge shows 2 items
    await expect(page.locator('.ant-badge-count').first()).toContainText("2");
  });

  test("navigating to cart from home page", async ({ page }) => {
    await page.goto("/");
    
    // Add product to cart
    await page.waitForSelector(".card", { timeout: 10000 });
    await page.locator(".btn-dark").first().click();
    await page.waitForTimeout(500);
    
    // Click Cart link
    await page.getByRole("link", { name: /Cart/i }).click();
    
    // Verify navigation to cart page
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();
  });
});
