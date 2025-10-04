import React, { useContext } from "react";
import { fireEvent, getByTestId, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/context/auth";
import axios from "axios";

// Mock axios
jest.mock("axios", () => ({
  defaults: {
    headers: {
      common: {},
    },
  },
}));

// A test component to consume the context
const TestComponent = ({ user = null, token = "" }) => {
  const [auth, setAuth] = useAuth();

  console.log(auth);
  return (
    <div>
      {auth.user === null && <div>User Null</div>}
      {auth.token === "" && <div>Token Empty</div>}

      {auth.user && auth.user._id && (
        <div data-testid="user-id">{auth.user._id}</div>
      )}
      {auth.user && auth.user.name && (
        <div data-testid="user-name">{auth.user.name}</div>
      )}
      {auth.user && auth.user.email && (
        <div data-testid="user-email">{auth.user.email}</div>
      )}
      {auth.user && auth.user.role !== undefined && (
        <div data-testid="user-role">{auth.user.role}</div>
      )}
      {auth.token && <div data-testid="token">{auth.token}</div>}
      <button onClick={() => setAuth({ user: user, token: token })}>
        Set Auth
      </button>
    </div>
  );
};

const TEST_USER_NAME = "test-user";
const TEST_USER_EMAIL = "test@gmail.com";
const TEST_USER_PHONE = "1234567890";
const TEST_USER_ADDRESS = "123 Test Street";
const TEST_USER_ID = "user123";
const TEST_USER_ROLE = 0; // 0 for regular user, 1 for admin

// Complete user type as per frontend specification
const TEST_USER = {
  _id: TEST_USER_ID,
  name: TEST_USER_NAME,
  email: TEST_USER_EMAIL,
  phone: TEST_USER_PHONE,
  address: TEST_USER_ADDRESS,
  role: TEST_USER_ROLE,
};

const TEST_TOKEN = "test-token";

// Invalid user types for testing
const INVALID_USER_MISSING_FIELDS = {
  name: TEST_USER_NAME,
  // Missing _id, email, phone, address, role
};

describe("AuthContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset axios headers
    axios.defaults.headers.common = {};
    // Mock console.error to suppress error logs in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
    // Clear all mocks
    jest.clearAllMocks();
  });

  test("initial state of auth context correct on initialisation", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("User Null")).toBeInTheDocument();
    expect(screen.getByText("Token Empty")).toBeInTheDocument();
  });

  test("initial state loaded from localstorage if not empty with complete user type", () => {
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: TEST_USER,
        token: TEST_TOKEN,
      })
    );
    const { getByTestId, queryByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("user-id").textContent).toBe(TEST_USER_ID);
    expect(getByTestId("user-name").textContent).toBe(TEST_USER_NAME);
    expect(getByTestId("user-email").textContent).toBe(TEST_USER_EMAIL);
    expect(getByTestId("user-role").textContent).toBe(
      TEST_USER_ROLE.toString()
    );
  });

  test("provides expected AuthContext child elements on update", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent user={TEST_USER} token={TEST_TOKEN} />
      </AuthProvider>
    );

    const userButton = screen.getByRole("button", { name: /Set Auth/ });
    fireEvent.click(userButton);

    expect(getByTestId("user-id").textContent).toBe(TEST_USER_ID);
    expect(getByTestId("user-name").textContent).toBe(TEST_USER_NAME);
    expect(getByTestId("user-email").textContent).toBe(TEST_USER_EMAIL);
    expect(getByTestId("user-role").textContent).toBe(
      TEST_USER_ROLE.toString()
    );
  });

  test("handles null localStorage value", () => {
    localStorage.setItem("auth", "null");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("User Null")).toBeInTheDocument();
    expect(screen.getByText("Token Empty")).toBeInTheDocument();
  });

  test("handles empty string in localStorage", () => {
    localStorage.setItem("auth", "");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("User Null")).toBeInTheDocument();
    expect(screen.getByText("Token Empty")).toBeInTheDocument();
  });

  test("handles malformed auth object in localStorage", () => {
    localStorage.setItem("auth", JSON.stringify({ invalidProperty: "test" }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("User Null")).toBeInTheDocument();
    expect(screen.getByText("Token Empty")).toBeInTheDocument();
  });

  test("handles user object with missing required fields", () => {
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: INVALID_USER_MISSING_FIELDS,
        token: TEST_TOKEN,
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("User Null")).toBeInTheDocument();
    expect(screen.getByText("Token Empty")).toBeInTheDocument();
  });

  // Test Case 4: Axios header testing
  test("sets axios header on initial load with token from localStorage", () => {
    localStorage.setItem(
      "auth",
      JSON.stringify({
        user: TEST_USER,
        token: TEST_TOKEN,
      })
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify axios header is set
    expect(axios.defaults.headers.common["Authorization"]).toBe(TEST_TOKEN);
  });

  test("updates axios header when setAuth is called with new token", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent user={TEST_USER} token={TEST_TOKEN} />
      </AuthProvider>
    );

    // Initial state - no token
    expect(axios.defaults.headers.common["Authorization"]).toBe("");

    // Update token
    const userButton = screen.getByRole("button", { name: /Set Auth/ });
    fireEvent.click(userButton);

    expect(axios.defaults.headers.common["Authorization"]).toBe(TEST_TOKEN);
  });

  test("clears axios header when token is removed", () => {
    // First render with token
    localStorage.setItem(
      "auth",
      JSON.stringify({ user: TEST_USER, token: TEST_TOKEN })
    );

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Token should be set
    expect(axios.defaults.headers.common["Authorization"]).toBe(TEST_TOKEN);

    // Simulate clearing localStorage + refresh
    localStorage.removeItem("auth");
    unmount(); // unmount old app
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });

  test("auth context is set to default when called with invalid user", () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent user={INVALID_USER_MISSING_FIELDS} token={TEST_TOKEN} />
      </AuthProvider>
    );
    const userButton = screen.getByRole("button", { name: /Set Auth/ });
    fireEvent.click(userButton);

    expect(screen.getByText("User Null")).toBeInTheDocument();
    expect(screen.getByText("Token Empty")).toBeInTheDocument();
  });
});
