import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import Forget from "../../../src/pages/Auth/Forget";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast");

// Mock Layout component
jest.mock("../../../src/components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" title={title}>
        {children}
      </div>
    );
  };
});

// This was written with AI
describe("Forget Component", () => {
  const mockAxios = axios;
  const mockToast = toast;

  // Test data constants
  const TEST_EMAIL = "test@example.com";
  const TEST_ANSWER = "test answer";
  const TEST_PASSWORD = "newPassword123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillFormAndSubmit = async () => {
    // Fill out the form
    const emailInput = screen.getByPlaceholderText("Enter Your Email");
    const answerInput = screen.getByPlaceholderText("Enter Your Answer");
    const passwordInput = screen.getByPlaceholderText("Enter New Password");
    const submitButton = screen.getByRole("button", { name: "RESET PASSWORD" });

    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } });
    fireEvent.change(answerInput, { target: { value: TEST_ANSWER } });
    fireEvent.change(passwordInput, { target: { value: TEST_PASSWORD } });

    // Submit the form
    fireEvent.click(submitButton);
  };

  test("renders forget password form correctly", () => {
    const { container } = render(<Forget />);

    // Check for title heading
    expect(container.querySelector(".title")).toHaveTextContent(
      "RESET PASSWORD"
    );
    expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter Your Answer")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter New Password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "RESET PASSWORD" })
    ).toBeInTheDocument();
  });

  test("allows user to input email, answer and password", () => {
    render(<Forget />);

    const emailInput = screen.getByPlaceholderText("Enter Your Email");
    const answerInput = screen.getByPlaceholderText("Enter Your Answer");
    const passwordInput = screen.getByPlaceholderText("Enter New Password");

    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } });
    fireEvent.change(answerInput, { target: { value: TEST_ANSWER } });
    fireEvent.change(passwordInput, { target: { value: TEST_PASSWORD } });

    expect(emailInput.value).toBe(TEST_EMAIL);
    expect(answerInput.value).toBe(TEST_ANSWER);
    expect(passwordInput.value).toBe(TEST_PASSWORD);
  });

  // Test Case 1: Verify axios post sent with correct params on successful input
  test("should call axios.post with correct parameters when form is submitted", async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Password reset successfully",
      },
    });

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockAxios.post).toHaveBeenCalledWith(
        "/api/v1/auth/forgot-password",
        {
          email: TEST_EMAIL,
          answer: TEST_ANSWER,
          newPassword: TEST_PASSWORD,
        }
      );
    });
  });

  // Test Case 2: Verify toast success called when axios returns with success
  test("should call toast.success when axios returns success response", async () => {
    const successResponse = {
      data: {
        success: true,
        message: "Password reset successfully",
      },
    };
    mockAxios.post.mockResolvedValue(successResponse);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledWith(
        "Password reset successfully"
      );
    });
  });

  test("should call toast.success even when success response has no message", async () => {
    const successResponse = {
      data: {
        success: true,
      },
    };
    mockAxios.post.mockResolvedValue(successResponse);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledWith(
        "Password reset successfully"
      );
    });
  });

  // Test Case 3: Verify toast error called when axios returns with failure
  test("should call toast.error when axios returns failure response with message", async () => {
    const failureResponse = {
      data: {
        success: false,
        message: "Invalid email or answer",
      },
    };
    mockAxios.post.mockResolvedValue(failureResponse);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith("Invalid email or answer");
    });
  });

  test("should call toast.error with default message when axios returns failure response without message", async () => {
    const failureResponse = {
      data: {
        success: false,
      },
    };
    mockAxios.post.mockResolvedValue(failureResponse);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("should call toast.error when response has no data", async () => {
    const emptyResponse = {};
    mockAxios.post.mockResolvedValue(emptyResponse);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  // Test Case 4: Verify toast error called when error thrown by axios
  test("should call toast.error when axios throws error with response data", async () => {
    const errorWithResponse = {
      response: {
        data: {
          message: "Server error occurred",
        },
      },
    };
    mockAxios.post.mockRejectedValue(errorWithResponse);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith("Server error occurred");
    });
  });

  test("should call toast.error when axios throws error without response data message", async () => {
    const errorWithoutMessage = {
      response: {
        data: {},
      },
    };
    mockAxios.post.mockRejectedValue(errorWithoutMessage);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("should call toast.error when axios throws error without response", async () => {
    const networkError = new Error("Network Error");
    mockAxios.post.mockRejectedValue(networkError);

    render(<Forget />);
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  test("should prevent form submission when required fields are empty", () => {
    render(<Forget />);

    const form = screen
      .getByRole("button", { name: "RESET PASSWORD" })
      .closest("form");
    const emailInput = screen.getByPlaceholderText("Enter Your Email");
    const answerInput = screen.getByPlaceholderText("Enter Your Answer");
    const passwordInput = screen.getByPlaceholderText("Enter New Password");

    // Verify required attributes are present
    expect(emailInput).toHaveAttribute("required");
    expect(answerInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should not call axios when form validation fails", async () => {
    render(<Forget />);

    // Try to submit form without filling required fields
    const submitButton = screen.getByRole("button", { name: "RESET PASSWORD" });
    fireEvent.click(submitButton);

    // axios should not be called due to HTML5 validation
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  test("should handle multiple form submissions correctly", async () => {
    mockAxios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Password reset successfully",
      },
    });

    render(<Forget />);

    // Submit form first time
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledTimes(1);
    });

    // Submit form second time
    await fillFormAndSubmit();

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
      expect(mockToast.success).toHaveBeenCalledTimes(2);
    });
  });

  test("should render with correct layout title", () => {
    render(<Forget />);

    const layout = screen.getByTestId("layout");
    expect(layout).toHaveAttribute("title", "Forget - Ecommerce App");
  });
});
