import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import About from "../../src/pages/About";

describe("About page", () => {
  test("renders text placeholder", () => {
    renderWithProviders(<About />);
    expect(screen.getByText(/Add text/i)).toBeInTheDocument();
  });
});
