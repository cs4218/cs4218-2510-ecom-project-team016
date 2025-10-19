import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import Policy from "../../src/pages/Policy";

describe("Policy page", () => {
  test("renders privacy policy texts", () => {
    renderWithProviders(<Policy />);
    expect(screen.getAllByText(/add privacy policy/i).length).toBeGreaterThan(1);
  });
});
