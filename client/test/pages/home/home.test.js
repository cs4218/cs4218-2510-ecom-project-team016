import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import HomePage from '../../../src/pages/HomePage';
import { useCart } from '../../../src/context/cart';

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../../src/context/cart');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
jest.mock('../../../src/components/Header');

const mockedAxios = axios;
const mockedToast = toast;
const mockedUseCart = useCart;

const mockCategories = [
  { _id: '1', name: 'Electronics' },
  { _id: '2', name: 'Clothing' }
];

const mockProducts = [
  {
    _id: '1',
    name: 'Test Product 1',
    price: 100,
    description: 'Test description for product 1',
    slug: 'test-product-1'
  },
  {
    _id: '2',
    name: 'Test Product 2',
    price: 200,
    description: 'Test description for product 2',
    slug: 'test-product-2'
  }
];

const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseCart.mockReturnValue([[], jest.fn()]);

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/category/get-category')) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      if (url.includes('/product/product-list')) {
        return Promise.resolve({
          data: { products: mockProducts }
        });
      }
      if (url.includes('/product/product-count')) {
        return Promise.resolve({
          data: { total: 2 }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedToast.success = jest.fn();
  });

  test('handles error in getAllCategory and logs to console', async () => {
    // Mock console.log to track calls
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
    // Mock axios to throw an error
    const testError = new Error('Network error');
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/category/get-category')) {
        return Promise.reject(testError);
      }
      // Return successful responses for other calls
      if (url.includes('/product/product-count')) {
        return Promise.resolve({ data: { total: 2 } });
      }
      return Promise.resolve({ data: {} });
    });
  
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );
  
    // Wait for the async call to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(testError);
    });
  
    // Clean up
    consoleSpy.mockRestore();
  });
  

  test('renders HomePage with initial elements', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('All Products')).toBeInTheDocument();
    expect(screen.getByText('Filter By Category')).toBeInTheDocument();
    expect(screen.getByText('Filter By Price')).toBeInTheDocument();
  });

  test('loads categories and products on mount', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-count');
    });
  });

  test('displays categories as checkboxes', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Electronics')).toBeInTheDocument();
      expect(screen.getByLabelText('Clothing')).toBeInTheDocument();
    });
  });

  test('displays products with correct information', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  test('handles category filter selection', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { products: [mockProducts[0]] }
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Electronics')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Electronics'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/product/product-filters',
        { checked: ['1'], radio: [] }
      );
    });
  });

  test('adds product to cart', async () => {
    const mockSetCart = jest.fn();
    mockedUseCart.mockReturnValue([[], mockSetCart]);

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByText('ADD TO CART');
    fireEvent.click(addToCartButtons[0]);

    expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
    expect(mockedToast.success).toHaveBeenCalledWith('Item Added to cart');
  });

  test('handles load more functionality', async () => {
    // Mock initial load with fewer products than total
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/product/product-count')) {
        return Promise.resolve({ data: { total: 10 } });
      }
      if (url.includes('/product/product-list')) {
        return Promise.resolve({ data: { products: mockProducts } });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Loadmore')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Loadmore'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
    });
  });

  test('handles error in getAllProducts, sets loading to false and logs error', async () => {
    // Mock console.log to track calls
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
    // Mock axios to throw error for product-list but succeed for others
    const testError = new Error('Failed to fetch products');
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/category/get-category')) {
        return Promise.resolve({
          data: { success: true, category: mockCategories }
        });
      }
      if (url.includes('/product/product-count')) {
        return Promise.resolve({ data: { total: 2 } });
      }
      if (url.includes('/product/product-list')) {
        return Promise.reject(testError);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );
  
    // Wait for the async operations to complete
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(testError);
    });
  
    // Verify that no products are displayed (empty state)
    expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
  
    // Clean up
    consoleSpy.mockRestore();
  });
  

  test('handles reset filters', async () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('RESET FILTERS')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('RESET FILTERS'));
    expect(mockReload).toHaveBeenCalled();
  });
});
