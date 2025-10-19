import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import Pagenotfound from "../../src/pages/Pagenotfound";

describe("Pagenotfound page", () => {
  test("renders 404 and Go Back link", () => {
    renderWithProviders(<Pagenotfound />);
    expect(screen.getByText(/404/)).toBeInTheDocument();
    const btn = screen.getByRole("link", { name: /Go Back/i });
    expect(btn).toHaveAttribute("href", "/");
  });
});
