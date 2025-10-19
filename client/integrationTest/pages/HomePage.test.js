import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import { AuthProvider } from "../../src/context/auth";
import { CartProvider, useCart } from "../../src/context/cart";
import { SearchProvider, useSearch } from "../../src/context/search";
import HomePage from "../../src/pages/HomePage";

// Mock toast Toaster and expose toast APIs
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));

// axios mock with programmable responses per URL
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

// Simple probe components for routed pages
function ProductProbe() {
  const { slug } = useParams();
  return <div data-testid="product-route">Product Route: {slug}</div>;
}

function CartProbe() {
  const [cart] = useCart();
  return <div data-testid="cart-route">Cart length: {cart.length}</div>;
}

function SearchProbe() {
  const [values] = useSearch();
  return (
    <div data-testid="search-route">
      Search Results: {Array.isArray(values.results) ? values.results.length : 0}
    </div>
  );
}

// Helper to render app with providers and routes
function renderApp({ initialEntries = ["/"], user = null, token = "", cart = [] } = {}) {
  // Ensure axios.defaults for AuthProvider if needed
  try {
    const axios = require("axios").default || require("axios");
    if (!axios.defaults) axios.defaults = { headers: { common: {} } };
    else if (!axios.defaults.headers) axios.defaults.headers = { common: {} };
    else if (!axios.defaults.headers.common) axios.defaults.headers.common = {};
  } catch {}

  if (cart) {
    window.localStorage.setItem("cart", JSON.stringify(cart));
  } else {
    window.localStorage.removeItem("cart");
  }

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SearchProvider>
        <AuthProvider user={user} token={token}>
          <CartProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:slug" element={<ProductProbe />} />
              <Route path="/cart" element={<CartProbe />} />
              <Route path="/search" element={<SearchProbe />} />
              <Route path="/categories" element={<div>Categories Route</div>} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </SearchProvider>
    </MemoryRouter>
  );
}

describe("HomePage integration", () => {
  const axios = require("axios").default;
  const toast = require("react-hot-toast").default;

  const productsPage1 = [
    { _id: "p1", slug: "product-1", name: "Product 1", description: "desc1", price: 100 },
    { _id: "p2", slug: "product-2", name: "Product 2", description: "desc2", price: 200 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    // Default GET mocks
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({ data: { success: true, category: [{ _id: "c1", name: "Cat1", slug: "cat1" }] } });
      }
      if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: { total: productsPage1.length } });
      }
      if (url === "/api/v1/product/product-list/1") {
        return Promise.resolve({ data: { products: productsPage1 } });
      }
      if (url.startsWith("/api/v1/product/search/")) {
        return Promise.resolve({ data: productsPage1 });
      }
      return Promise.resolve({ data: {} });
    });
    // Default POST mocks
    axios.post.mockImplementation((url) => {
      if (url === "/api/v1/product/product-filters") {
        return Promise.resolve({ data: { products: productsPage1 } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  test("clicking More Details navigates to Product Details route with slug", async () => {
    renderApp();

    // Wait for products to render
    const moreBtns = await screen.findAllByRole("button", { name: /More Details/i });
    expect(moreBtns.length).toBeGreaterThan(0);

    await userEvent.click(moreBtns[0]);

    // Product route probe should render with correct slug
    expect(await screen.findByTestId("product-route")).toHaveTextContent("product-1");
  });

  test("adding to cart updates state and navigating to Cart shows item count", async () => {
    renderApp();

    // Click add to cart on first product
    const addBtns = await screen.findAllByRole("button", { name: /ADD TO CART/i });
    await userEvent.click(addBtns[0]);

    // Toast called and cart persisted
    expect(toast.success).toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem("cart")).length).toBe(1);

    // Click Cart link in header to navigate
    await userEvent.click(screen.getByRole("link", { name: /Cart/i }));

    // Cart route probe shows updated cart length
    expect(await screen.findByTestId("cart-route")).toHaveTextContent("Cart length: 1");
  });

  test("search from header navigates to /search with results in context", async () => {
    renderApp();

    // Type a search term and submit
    const input = await screen.findByRole("searchbox", { name: /Search/i });
    await userEvent.type(input, "product");
    await userEvent.click(screen.getByRole("button", { name: /Search/i }));

    // Should navigate to /search and show results length via probe
    expect(await screen.findByTestId("search-route")).toHaveTextContent("Search Results: 2");
  });

  test("clicking Categories navigates to categories page", async () => {
    renderApp();

    // Click the 'All Categories' item to avoid matching the dropdown toggle
    const allCategoriesLink = await screen.findByRole("link", { name: /All Categories/i });
    await userEvent.click(allCategoriesLink);

    // Stubbed categories route renders
    expect(await screen.findByText(/Categories Route/i)).toBeInTheDocument();
  });
});
