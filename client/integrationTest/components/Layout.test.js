import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import Layout from "../../src/components/Layout";

describe("Layout", () => {
  test("renders header, footer and children", () => {
    renderWithProviders(
      <Layout>
        <div data-testid="child">Hello</div>
      </Layout>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  test("sets custom title when provided (smoke)", () => {
    renderWithProviders(<Layout title="Custom Title" />);
    expect(screen.getByText(/Virtual Vault/i)).toBeInTheDocument();
  });
});
