import React, { useContext } from "react";
import { render } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/context/auth";
import { createContext } from "vm";

// A test component to consume the context
const TestComponent = () => {
  const [auth] = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user : "No user"}</div>
      <div data-testid="admin">{auth.token ? auth.token : "No token"}</div>
    </div>
  );
};

describe("<AuthProvider />", () => {
  test("provides expected AuthContext to child elements", () => {
    const testAuthContext = {
      expectedUser: "John Doe",
      expectedToken: "test token",
    };

    const { getByTestId } = render(
      <AuthProvider
        user={testAuthContext.expectedUser}
        token={testAuthContext.expectedToken}
      >
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId("user").textContent).toBe(testAuthContext.expectedUser);
    expect(getByTestId("admin").textContent).toBe(
      testAuthContext.expectedToken
    );
  });
});
