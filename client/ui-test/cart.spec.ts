import { test, expect } from "@playwright/test";
import { seedLocalStorage } from "./_utils";
import { cartWithOne, productsPage1 } from "./_fixtures";

async function ensureRealUserToken(baseURL: string, request: any) {
  const email = `e2e_${Date.now()}@example.com`;
  const payload = {
    name: "E2E User",
    email,
    password: "Password1!",
    phone: "12345678",
    address: "123 Test St",
    answer: "a",
  };
  await request.post(`${baseURL}/api/v1/auth/register`, { data: payload }).catch(() => {});
  const loginRes = await request.post(`${baseURL}/api/v1/auth/login`, {
    data: { email, password: payload.password },
  });
  const loginJson = await loginRes.json();
  if (!loginRes.ok()) throw new Error(`Login failed: ${loginRes.status()} ${JSON.stringify(loginJson)}`);
  return { token: loginJson.token, user: loginJson.user };
}

test.describe("Cart E2E - Guest User", () => {
  test("displays empty cart message when cart is empty", async ({ page }) => {
    await seedLocalStorage(page, { cart: [] });
    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: /Hello Guest/i })).toBeVisible();
    await expect(page.getByText(/Your Cart Is Empty/i)).toBeVisible();
  });

  test("shows cart items and prompts guest to login", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: /Hello Guest/i })).toBeVisible();
    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();
    await expect(page.getByText(/please login to checkout/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Plase Login to checkout/i })).toBeVisible();
  });

  test("displays product details in cart", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    // Verify product name is displayed
    await expect(page.getByText(cartWithOne[0].name)).toBeVisible();
    
    // Verify product price is displayed
    await expect(page.getByText(new RegExp(`Price.*${cartWithOne[0].price}`, "i"))).toBeVisible();
    
    // Verify Remove button exists
    await expect(page.getByRole("button", { name: /Remove/i })).toBeVisible();
  });

  test("allows removing items from cart as guest", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();

    // Remove the item
    await page.getByRole("button", { name: /Remove/i }).click();

    await expect(page.getByText(/Your Cart Is Empty/i)).toBeVisible();
  });

  test("clicking login button navigates to login page", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    // Click login button
    await page.getByRole("button", { name: /Plase Login to checkout/i }).click();

    // Verify navigation to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("displays cart summary with total price", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    // Verify Cart Summary section exists
    await expect(page.getByText("Cart Summary")).toBeVisible();
    await expect(page.getByText(/Total.*Checkout.*Payment/i)).toBeVisible();
    
    // Verify total price is displayed
    await expect(page.getByText(/Total.*\$/i)).toBeVisible();
  });
});

test.describe("Cart E2E - Multiple Items", () => {
  test("displays multiple items in cart correctly", async ({ page }) => {
    const multipleItems = [
      { ...cartWithOne[0], _id: "p1" },
      { ...productsPage1[1], _id: "p2" },
    ];
    await seedLocalStorage(page, { cart: multipleItems });
    await page.goto("/cart");

    await expect(page.getByText(/You Have 2 items in your cart/i)).toBeVisible();
    
    // Verify both products are displayed
    await expect(page.getByText(multipleItems[0].name)).toBeVisible();
    await expect(page.getByText(multipleItems[1].name)).toBeVisible();
  });

  test("removes specific item from multi-item cart", async ({ page }) => {
    const multipleItems = [
      { ...cartWithOne[0], _id: "p1" },
      { ...productsPage1[1], _id: "p2" },
    ];
    await seedLocalStorage(page, { cart: multipleItems });
    await page.goto("/cart");

    await expect(page.getByText(/You Have 2 items in your cart/i)).toBeVisible();

    // Remove first item
    await page.getByRole("button", { name: /Remove/i }).first().click();

    // Verify cart now has 1 item
    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();
    
    // Verify second product is still there
    await expect(page.getByText(multipleItems[1].name)).toBeVisible();
  });

  test("calculates total price correctly for multiple items", async ({ page }) => {
    const multipleItems = [
      { ...cartWithOne[0], _id: "p1", price: 100 },
      { ...productsPage1[1], _id: "p2", price: 200 },
    ];
    await seedLocalStorage(page, { cart: multipleItems });
    await page.goto("/cart");

    // Verify total displays sum (implementation shows individual prices added)
    await expect(page.getByText(/Total.*\$300/i)).toBeVisible();
  });
});

test.describe("Cart E2E - Authenticated User", () => {
  test("shows user name and address update option for logged in user", async ({ page, baseURL, request }) => {
    if (!baseURL) test.skip();
    
    const { token, user } = await ensureRealUserToken(baseURL!, request);
    await seedLocalStorage(page, { auth: { user, token }, cart: cartWithOne });
    await page.goto("/cart");

    // Verify user greeting
    await expect(page.getByRole("heading", { name: new RegExp(`Hello.*${user.name}`, "i") })).toBeVisible();
    
    // Verify current address is shown
    await expect(page.getByText("Current Address")).toBeVisible();
    await expect(page.getByText(user.address)).toBeVisible();
    
    // Verify Update Address button exists
    await expect(page.getByRole("button", { name: /Update Address/i })).toBeVisible();
  });

  test("clicking Update Address navigates to profile page", async ({ page, baseURL, request }) => {
    if (!baseURL) test.skip();
    
    const { token, user } = await ensureRealUserToken(baseURL!, request);
    await seedLocalStorage(page, { auth: { user, token }, cart: cartWithOne });
    await page.goto("/cart");

    // Click Update Address
    await page.getByRole("button", { name: /Update Address/i }).click();

    // Verify navigation to profile page
    await expect(page).toHaveURL(/\/dashboard\/user\/profile/);
  });

  test("authenticated user can remove items from cart", async ({ page, baseURL, request }) => {
    if (!baseURL) test.skip();
    
    const { token, user } = await ensureRealUserToken(baseURL!, request);
    await seedLocalStorage(page, { auth: { user, token }, cart: cartWithOne });
    await page.goto("/cart");

    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();

    // Remove the item
    await page.getByRole("button", { name: /Remove/i }).click();

    // Verify cart is empty
    await expect(page.getByText(/Your Cart Is Empty/i)).toBeVisible();
  });
});

test.describe("Cart E2E - Navigation and Persistence", () => {
  test("cart persists after page refresh", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();

    // Refresh page
    await page.reload();

    // Verify cart still has the item
    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();
    await expect(page.getByText(cartWithOne[0].name)).toBeVisible();
  });

  test("navigating from cart to home and back preserves cart", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();

    // Navigate to Home
    await page.getByRole("link", { name: /Home/i }).click();
    await page.waitForLoadState("networkidle");

    // Navigate back to Cart
    await page.getByRole("link", { name: /Cart/i }).click();

    // Verify cart still has the item
    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();
  });

  test("cart badge in header shows correct count", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    // Check cart badge shows count
    await expect(page.locator('.ant-badge-count').first()).toContainText("1");
  });
});

test.describe("Cart E2E - Edge Cases", () => {
  test("handles cart with product missing price gracefully", async ({ page }) => {
    const itemNoPriceDisplayed = [{ ...cartWithOne[0], price: 0 }];
    await seedLocalStorage(page, { cart: itemNoPriceDisplayed });
    await page.goto("/cart");

    // Verify page still loads
    await expect(page.getByRole("heading", { name: /Hello Guest/i })).toBeVisible();
    await expect(page.getByText(cartWithOne[0].name)).toBeVisible();
  });

  test("removing last item shows empty cart message", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    await page.getByRole("button", { name: /Remove/i }).click();

    // Verify empty message and no items displayed
    await expect(page.getByText(/Your Cart Is Empty/i)).toBeVisible();
    await expect(page.getByText(cartWithOne[0].name)).not.toBeVisible();
  });

  test("cart page loads when accessed directly via URL", async ({ page }) => {
    await seedLocalStorage(page, { cart: cartWithOne });
    await page.goto("/cart");

    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText(/You Have 1 items in your cart/i)).toBeVisible();
  });
});
