import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../testUtils";
import CartPage from "../../src/pages/CartPage";

describe("CartPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("shows empty cart message when no items", () => {
    renderWithProviders(<CartPage />, { cart: [] });
    expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });

  test("shows login prompt when items present but user not authenticated", async () => {
    const cart = [{ _id: "p1", name: "P", description: "desc", price: 5 }];
    renderWithProviders(<CartPage />, { cart });
    expect(screen.getByText(/You Have 1 items in your cart/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Plase Login to checkout/i })).toBeInTheDocument();
  });

  test("removes an item from cart", async () => {
    const cart = [{ _id: "p2", name: "Widget", description: "great", price: 10 }];
    renderWithProviders(<CartPage />, { cart });
    await userEvent.click(screen.getByRole("button", { name: /Remove/i }));
    expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });
});
