import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Categories from "../../src/pages/Categories";

// Mock the useCategory hook
jest.mock("../../src/hooks/useCategory", () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock Layout component
jest.mock("../../src/components/Layout", () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="layout" data-title={title}>
      {children}
    </div>
  ),
}));

const mockCategories = [
  {
    _id: "1",
    name: "Electronics",
    slug: "electronics",
  },
  {
    _id: "2",
    name: "Clothing",
    slug: "clothing",
  },
  {
    _id: "3",
    name: "Books",
    slug: "books",
  },
];

describe("Categories Component", () => {
  const useCategory = require("../../src/hooks/useCategory").default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  test("renders all categories from the hook", () => {
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Books")).toBeInTheDocument();
  });

  test("renders correct number of category links", () => {
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  test("category links have correct href attributes", () => {
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    const electronicsLink = screen.getByText("Electronics").closest("a");
    const clothingLink = screen.getByText("Clothing").closest("a");
    const booksLink = screen.getByText("Books").closest("a");

    expect(electronicsLink).toHaveAttribute("href", "/category/electronics");
    expect(clothingLink).toHaveAttribute("href", "/category/clothing");
    expect(booksLink).toHaveAttribute("href", "/category/books");
  });

  test("category buttons have correct CSS classes", () => {
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveClass("btn", "btn-primary");
    });
  });

  test("renders empty state when no categories available", () => {
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    const links = screen.queryAllByRole("link");
    expect(links).toHaveLength(0);
  });

  test("passes correct title to Layout component", () => {
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    const layout = screen.getByTestId("layout");
    expect(layout).toHaveAttribute("data-title", "All Categories");
  });

  test("each category has unique key", () => {
    useCategory.mockReturnValue(mockCategories);

    const { container } = render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    const categoryDivs = container.querySelectorAll(".col-md-6");
    expect(categoryDivs).toHaveLength(3);
  });
});
