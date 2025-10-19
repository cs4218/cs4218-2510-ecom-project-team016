import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import Contact from "../../src/pages/Contact";

describe("Contact page", () => {
  test("renders heading and contact info", () => {
    renderWithProviders(<Contact />);
    expect(screen.getByRole("heading", { name: /CONTACT US/i })).toBeInTheDocument();
    expect(screen.getByText(/help@ecommerceapp.com/i)).toBeInTheDocument();
    expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
  });
});
