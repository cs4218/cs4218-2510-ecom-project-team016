import type { Page } from "@playwright/test";

export async function seedLocalStorage(
  page: Page,
  {
    auth,
    cart,
  }: {
    auth?: unknown;
    cart?: unknown;
  } = {}
) {
  await page.addInitScript(({ auth, cart }) => {
    if (auth) localStorage.setItem("auth", JSON.stringify(auth));
    if (cart) localStorage.setItem("cart", JSON.stringify(cart));
  }, { auth, cart });
}

export function stubApiRoutes(page: Page, options: {
  categories?: any;
  productCount?: any;
  productList?: any;
  userAuthOk?: boolean;
  braintreeToken?: string;
  braintreePaymentOk?: boolean;
  orders?: any[];
} = {}) {
  const {
    categories,
    productCount,
    productList,
    userAuthOk = true,
    braintreeToken = "fake-token",
    braintreePaymentOk = true,
    orders = [],
  } = options;

  // Category endpoints
  page.route("**/api/v1/category/get-category", async route => {
    await route.fulfill({ json: { success: true, category: categories ?? [] } });
  });

  // Product endpoints
  page.route("**/api/v1/product/product-count", async route => {
    await route.fulfill({ json: productCount ?? { total: 0 } });
  });

  page.route("**/api/v1/product/product-list/*", async route => {
    await route.fulfill({ json: { success: true, products: productList ?? [] } });
  });

  // Search endpoint (return empty by default)
  page.route("**/api/v1/product/search/**", async route => {
    await route.fulfill({ json: [] });
  });

  // Private auth guard for PrivateRoute
  page.route("**/api/v1/auth/user-auth", async route => {
    await route.fulfill({ json: { ok: userAuthOk } });
  });

  // Braintree endpoints
  page.route("**/api/v1/product/braintree/token", async route => {
    await route.fulfill({ json: { clientToken: braintreeToken } });
  });

  page.route("**/api/v1/product/braintree/payment", async route => {
    await route.fulfill({ json: braintreePaymentOk ? { ok: true } : { ok: false } });
  });

  // Orders endpoint used by Orders page
  page.route("**/api/v1/auth/orders", async route => {
    await route.fulfill({ json: orders });
  });

  // Product photos to avoid 404 noise
  page.route("**/api/v1/product/product-photo/**", async route => {
    await route.fulfill({ status: 204 });
  });
}
