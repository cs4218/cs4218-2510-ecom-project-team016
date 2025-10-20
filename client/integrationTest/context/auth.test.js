import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "../../src/context/auth";
import Header from "../../src/components/Header";
import toast from "react-hot-toast";

// test constants
const testUser = {
  _id: "test_id",
  name: "test_name",
  email: "testuser@gmail.com",
  phone: "80002001",
  address: "seseame street",
  role: 0,
};

const testToken = "test_token";

const mockUseCart = jest.fn();
const mockUseCategory = jest.fn();

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

jest.mock("client/src/context/cart", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("client/src/hooks/useCategory", () => () => mockUseCategory());

jest.mock("client/src/components/Form/SearchInput", () => () => (
  <div>SearchInput</div>
));

// Component to test auth context state
const AuthContextTester = () => {
  const [auth] = useAuth();
  return (
    <div data-testid="auth-context-tester">
      <span data-testid="auth-user">{JSON.stringify(auth.user)}</span>
      <span data-testid="auth-token">{auth.token}</span>
    </div>
  );
};

describe("Login and Auth Context Integration Test", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();

    // Mock toast methods
    toast.success = jest.fn();
    toast.error = jest.fn();
  });

  const setup = (authValue = null, cartValue = [], categoriesValue = []) => {
    mockUseCart.mockReturnValue([cartValue]);
    mockUseCategory.mockReturnValue(categoriesValue);
  };

  test("Test integration between AuthContext and Header during logout. Context should be cleared", async () => {
    setup(null, [], [{ _id: "1", name: "Cat1", slug: "cat1" }]);
    const { getByPlaceholderText, getByText, getByTestId } = render(
      <AuthProvider user={testUser} token={testToken}>
        <MemoryRouter>
          <Header />
          <AuthContextTester />
        </MemoryRouter>
      </AuthProvider>
    );

    const logoutButton = getByText("Logout");
    fireEvent.click(logoutButton);

    const authUser = getByTestId("auth-user");
    const authToken = getByTestId("auth-token");

    expect(authUser.textContent).toBe(JSON.stringify(null));
    expect(authToken.textContent).toBe("");
  });
});
