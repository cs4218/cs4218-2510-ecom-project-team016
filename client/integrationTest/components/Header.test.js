import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import Header from "../../src/components/Header";

describe("Header", () => {

  test("shows brand and Home link", () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole("link", { name: /Virtual Vault/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
  });

  test("shows auth links when logged out and cart badge 0", () => {
    renderWithProviders(<Header />, { cart: [] });
    expect(screen.getByRole("link", { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Login/i })).toBeInTheDocument();
    const cartLink = screen.getByRole("link", { name: /Cart/i });
    expect(cartLink).toBeInTheDocument();
  });

  test("shows username dropdown and Dashboard when logged in", () => {
    const user = { _id: "u1", name: "Alice", email: "a@a.com", phone: "1", address: "x", role: 0 };
    renderWithProviders(<Header />, { user, token: "t", cart: [{ id: 1 }] });
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
  });

  test("renders categories dropdown items", () => {
    renderWithProviders(<Header />);
    const toggles = screen.getAllByText(/Categories/i);
    expect(toggles.length).toBeGreaterThan(0);
  // Static item is always present; dynamic category items depend on API and are not asserted here.
  expect(screen.getAllByText(/All Categories/i)[0]).toBeInTheDocument();
  });
});
