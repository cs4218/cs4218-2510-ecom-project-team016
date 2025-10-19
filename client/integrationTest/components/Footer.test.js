import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import Footer from "../../src/components/Footer";

describe("Footer", () => {
  test("renders links and text", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/All Rights Reserved/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /About/i })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: /Contact/i })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toHaveAttribute("href", "/policy");
  });
});
