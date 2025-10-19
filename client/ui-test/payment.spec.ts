import { test, expect } from "@playwright/test";

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

test.describe("Payment E2E", () => {
  test("posts a real payment using sandbox nonce and validates response", async ({ baseURL, request }) => {
    test.setTimeout(30000);
    if (!baseURL) throw new Error("Base URL is not set");

    // Auth
    const { token } = await ensureRealUserToken(baseURL, request);

    // Ensure Braintree token endpoint is live
    const tokenRes = await request.get(`${baseURL}/api/v1/product/braintree/token`);
    if (!tokenRes.ok()) test.skip();
    const tokenJson = await tokenRes.json().catch(() => ({} as any));
    if (!tokenJson?.clientToken) test.skip();

    // Build a minimal cart (server only reads price for amount)
    const cart = [
      { _id: "p-test-1", name: "Test Item", price: 1 },
    ];

    // Prepare request payload
    const payload = {
      nonce: "fake-valid-nonce",
      cart,
    };

    // POST payment with Authorization header (requireSignIn)
    const paymentRes = await request.post(`${baseURL}/api/v1/product/braintree/payment`, {
      headers: { Authorization: token },
      data: payload,
    });

    // Validate request/response
    expect(paymentRes.ok()).toBeTruthy();
    const json = await paymentRes.json().catch(() => ({} as any));
    expect(json && typeof json === "object").toBeTruthy();
    expect(json.ok).toBe(true);
  });
});
