import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Search from '../../src/pages/Search';

// Mock the Layout component
jest.mock('../../src/components/Layout', () => {
  return function MockLayout({ title, children }) {
    return (
      <div data-testid="layout" title={title}>
        {children}
      </div>
    );
  };
});

// Mock the useSearch hook
const mockUseSearch = jest.fn();
jest.mock('../../src/context/search', () => ({
  useSearch: () => mockUseSearch(),
}));

describe('Search Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search results title', () => {
    mockUseSearch.mockReturnValue([
      { results: [] },
      jest.fn()
    ]);

    render(<Search />);

    expect(screen.getByText('Search Resuts')).toBeInTheDocument();
  });

  test('displays "No Products Found" when no results', () => {
    mockUseSearch.mockReturnValue([
      { results: [] },
      jest.fn()
    ]);

    render(<Search />);

    expect(screen.getByText('No Products Found')).toBeInTheDocument();
  });

  test('displays product count when results exist', () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Product 1',
        description: 'This is a test product description that is longer than 30 characters',
        price: 29.99
      },
      {
        _id: '2',
        name: 'Product 2',
        description: 'Another test product description',
        price: 49.99
      }
    ];

    mockUseSearch.mockReturnValue([
      { results: mockProducts },
      jest.fn()
    ]);

    render(<Search />);

    expect(screen.getByText('Found 2')).toBeInTheDocument();
  });

  test('renders product cards correctly', () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Test Product',
        description: 'This is a test product description that is longer than 30 characters',
        price: 29.99
      }
    ];

    mockUseSearch.mockReturnValue([
      { results: mockProducts },
      jest.fn()
    ]);

    render(<Search />);

    // Check product name
    expect(screen.getByText('Test Product')).toBeInTheDocument();

    // Check truncated description
    expect(screen.getByText('This is a test product descrip...')).toBeInTheDocument();

    // Check price
    expect(screen.getByText('$ 29.99')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('More Details')).toBeInTheDocument();
    expect(screen.getByText('ADD TO CART')).toBeInTheDocument();

    // Check image
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/api/v1/product/product-photo/1');
  });

  test('renders multiple product cards', () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Product 1',
        description: 'First product description',
        price: 29.99
      },
      {
        _id: '2',
        name: 'Product 2',
        description: 'Second product description',
        price: 49.99
      },
      {
        _id: '3',
        name: 'Product 3',
        description: 'Third product description',
        price: 19.99
      }
    ];

    mockUseSearch.mockReturnValue([
      { results: mockProducts },
      jest.fn()
    ]);

    render(<Search />);

    // Check that all products are rendered
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();

    // Check count
    expect(screen.getByText('Found 3')).toBeInTheDocument();

    // Check that we have 6 buttons (2 per product)
    expect(screen.getAllByText('More Details')).toHaveLength(3);
    expect(screen.getAllByText('ADD TO CART')).toHaveLength(3);
  });

  test('handles products with short descriptions', () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Short Desc Product',
        description: 'Short desc',
        price: 15.99
      }
    ];

    mockUseSearch.mockReturnValue([
      { results: mockProducts },
      jest.fn()
    ]);

    render(<Search />);

    // Should still show the ellipsis even for short descriptions
    expect(screen.getByText('Short desc...')).toBeInTheDocument();
  });

  test('passes correct title to Layout component', () => {
    mockUseSearch.mockReturnValue([
      { results: [] },
      jest.fn()
    ]);

    render(<Search />);

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveAttribute('title', 'Search results');
  });

  test('handles undefined values from useSearch', () => {
    mockUseSearch.mockReturnValue([
      undefined,
      jest.fn()
    ]);

    render(<Search />);

    // Should not crash and should show no products found
    expect(screen.getByText('No Products Found')).toBeInTheDocument();
  });

  test('handles null results array', () => {
    mockUseSearch.mockReturnValue([
      { results: null },
      jest.fn()
    ]);

    render(<Search />);

    // Should not crash and should show no products found
    expect(screen.getByText('No Products Found')).toBeInTheDocument();
  });
});
