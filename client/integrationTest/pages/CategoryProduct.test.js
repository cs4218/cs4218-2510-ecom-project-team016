import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import CategoryProduct from "../../src/pages/CategoryProduct";
import axios from "axios";

// Mock axios
jest.mock("axios");

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
}));

// Mock Layout component
jest.mock("../../src/components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

const mockCategory = {
  _id: "cat1",
  name: "Electronics",
  slug: "electronics",
};

const mockProducts = [
  {
    _id: "1",
    name: "Laptop",
    slug: "laptop",
    description: "High performance laptop with great features for developers",
    price: 999.99,
  },
  {
    _id: "2",
    name: "Smartphone",
    slug: "smartphone",
    description: "Latest smartphone with amazing camera and battery life for all",
    price: 599.99,
  },
];

describe("CategoryProduct Component", () => {
  const { useParams } = require("react-router-dom");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockResolvedValue({ data: { products: [], category: {} } });

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });


  test("displays all products with correct information", async () => {
    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockResolvedValue({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Smartphone")).toBeInTheDocument();
    });

    expect(screen.getByText("$999.99")).toBeInTheDocument();
    expect(screen.getByText("$599.99")).toBeInTheDocument();
  });

  test("truncates long product descriptions", async () => {
    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockResolvedValue({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("High performance laptop with great features for developers...")
      ).toBeInTheDocument();
    });
  });

  test("renders product images with correct src", async () => {
    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockResolvedValue({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute(
        "src",
        "/api/v1/product/product-photo/1"
      );
      expect(images[1]).toHaveAttribute(
        "src",
        "/api/v1/product/product-photo/2"
      );
    });
  });

  test("displays correct count when no products found", async () => {
    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockResolvedValue({
      data: {
        products: [],
        category: mockCategory,
      },
    });

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("0 result found")).toBeInTheDocument();
    });
  });

  test("handles API error gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockRejectedValue(new Error("API Error"));

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test("refetches data when slug parameter changes", async () => {
    const { rerender } = render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockResolvedValue({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    rerender(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/product-category/electronics"
      );
    });

    // Change slug
    useParams.mockReturnValue({ slug: "clothing" });
    axios.get.mockResolvedValue({
      data: {
        products: [],
        category: { name: "Clothing" },
      },
    });

    rerender(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/product-category/clothing"
      );
    });
  });

  test("formats price as USD currency", async () => {
    useParams.mockReturnValue({ slug: "electronics" });
    axios.get.mockResolvedValue({
      data: {
        products: mockProducts,
        category: mockCategory,
      },
    });

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("$999.99")).toBeInTheDocument();
      expect(screen.getByText("$599.99")).toBeInTheDocument();
    });
  });

  test("does not fetch products if slug is undefined", () => {
    useParams.mockReturnValue({});

    render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    );

    expect(axios.get).not.toHaveBeenCalled();
  });
});
