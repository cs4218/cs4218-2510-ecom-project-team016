import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Search from "../../src/pages/Search";
import { SearchProvider } from "../../src/context/search";

jest.mock("../../src/context/search", () => ({
  useSearch: jest.fn(),
  SearchProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../src/components/Layout", () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}));

const mockProducts = [
  {
    _id: "1",
    name: "Product 1",
    description: "This is a test product description",
    price: 99.99,
  },
  {
    _id: "2",
    name: "Product 2",
    description: "Another product description here",
    price: 149.99,
  },
];

describe("Search Component", () => {
  const { useSearch } = require("../../src/context/search");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders 'No Products Found' when no results", () => {
    useSearch.mockReturnValue([{ results: [] }, jest.fn()]);

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  test("displays correct number of products found", () => {
    useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    expect(screen.getByText("Found 2")).toBeInTheDocument();
  });

  test("renders product cards with correct information", () => {
    useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("$ 99.99")).toBeInTheDocument();
    expect(screen.getByText("$ 149.99")).toBeInTheDocument();
  });

  test("renders product images with correct src", () => {
    useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

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

  test("renders action buttons for each product", () => {
    useSearch.mockReturnValue([{ results: mockProducts }, jest.fn()]);

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    const moreDetailsButtons = screen.getAllByText("More Details");
    const addToCartButtons = screen.getAllByText("ADD TO CART");

    expect(moreDetailsButtons).toHaveLength(2);
    expect(addToCartButtons).toHaveLength(2);
  });
});
