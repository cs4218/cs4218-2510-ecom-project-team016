// Shared test utilities for rendering with providers and router
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { AuthProvider } from "../src/context/auth";
import { CartProvider } from "../src/context/cart";
import { SearchProvider } from "../src/context/search";
import axios from "axios";

export function renderWithProviders(ui, { route = "/", user = null, token = "", cart = null } = {}) {
  try {
    if (!axios.defaults) {
      axios.defaults = { headers: { common: {} } };
    } else if (!axios.defaults.headers) {
      axios.defaults.headers = { common: {} };
    } else if (!axios.defaults.headers.common) {
      axios.defaults.headers.common = {};
    }
  } catch (e) {
  }
  if (cart !== null) {
    window.localStorage.setItem("cart", JSON.stringify(cart));
  } else {
    window.localStorage.removeItem("cart");
  }

  // AuthProvider accepts initial user/token via props
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SearchProvider>
        <AuthProvider user={user} token={token}>
          <CartProvider>{ui}</CartProvider>
        </AuthProvider>
      </SearchProvider>
    </MemoryRouter>
  );
}
