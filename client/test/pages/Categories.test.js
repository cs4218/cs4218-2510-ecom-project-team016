import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Categories from '../../src/pages/Categories';
import useCategory from '../../src/hooks/useCategory';
import Layout from '../../src/components/Layout';

// Mock the custom hook
jest.mock('../../src/hooks/useCategory');

// Mock the Layout component
jest.mock('../../src/components/Layout', () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

// Helper function to render with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Categories Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Layout with correct title', () => {
    useCategory.mockReturnValue([]);

    renderWithRouter(<Categories />);

    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('should render categories list with links', () => {
    const mockCategories = [
      { _id: '1', name: 'Electronics', slug: 'electronics' },
      { _id: '2', name: 'Clothing', slug: 'clothing' },
      { _id: '3', name: 'Books', slug: 'books' }
    ];

    useCategory.mockReturnValue(mockCategories);

    renderWithRouter(<Categories />);

    // Check if all category names are rendered
    mockCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });

    // Check if links are rendered with correct href
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);

    links.forEach((link, index) => {
      expect(link).toHaveAttribute('href', `/category/${mockCategories[index].slug}`);
      expect(link).toHaveClass('btn', 'btn-primary');
    });
  });

  it('should render empty state when no categories', () => {
    useCategory.mockReturnValue([]);

    renderWithRouter(<Categories />);

    const container = screen.getByTestId('layout');
    expect(container).toBeInTheDocument();

    // Should not find any links
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(0);
  });

  it('should apply correct CSS classes to category items', () => {
    const mockCategories = [
      { _id: '1', name: 'Test Category', slug: 'test-category' }
    ];

    useCategory.mockReturnValue(mockCategories);

    const { container } = renderWithRouter(<Categories />);

    // Check for Bootstrap classes
    expect(container.querySelector('.container')).toBeInTheDocument();
    expect(container.querySelector('.row')).toBeInTheDocument();
    expect(container.querySelector('.col-md-6')).toBeInTheDocument();
    expect(container.querySelector('.mt-5')).toBeInTheDocument();
    expect(container.querySelector('.mb-3')).toBeInTheDocument();
    expect(container.querySelector('.gx-3')).toBeInTheDocument();
    expect(container.querySelector('.gy-3')).toBeInTheDocument();
  });

  it('should handle large number of categories', () => {
    const mockCategories = Array.from({ length: 20 }, (_, i) => ({
      _id: `id-${i}`,
      name: `Category ${i}`,
      slug: `category-${i}`
    }));

    useCategory.mockReturnValue(mockCategories);

    renderWithRouter(<Categories />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(20);
  });

  it('should use category._id as key prop', () => {
    const mockCategories = [
      { _id: 'unique-id-1', name: 'Category 1', slug: 'category-1' },
      { _id: 'unique-id-2', name: 'Category 2', slug: 'category-2' }
    ];

    useCategory.mockReturnValue(mockCategories);

    const { container } = renderWithRouter(<Categories />);

    const categoryDivs = container.querySelectorAll('.col-md-6');
    expect(categoryDivs).toHaveLength(2);

    // React uses keys internally, so we can't directly test them
    // But we can verify the structure is correct
    categoryDivs.forEach((div, index) => {
      const link = div.querySelector('a');
      expect(link).toHaveTextContent(mockCategories[index].name);
    });
  });

  it('should render categories with special characters in names', () => {
    const mockCategories = [
      { _id: '1', name: 'Sports & Outdoors', slug: 'sports-outdoors' },
      { _id: '2', name: 'Home & Garden', slug: 'home-garden' },
      { _id: '3', name: 'Toys/Games', slug: 'toys-games' }
    ];

    useCategory.mockReturnValue(mockCategories);

    renderWithRouter(<Categories />);

    expect(screen.getByText('Sports & Outdoors')).toBeInTheDocument();
    expect(screen.getByText('Home & Garden')).toBeInTheDocument();
    expect(screen.getByText('Toys/Games')).toBeInTheDocument();
  });
});
