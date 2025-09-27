import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import CategoryProduct from '../../src/pages/CategoryProduct';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock('../../src/components/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('../../src/styles/CategoryProductStyles.css', () => ({}));

const mockedAxios = axios;
const mockNavigate = jest.fn();
const mockUseParams = require('react-router-dom').useParams;
const mockUseNavigate = require('react-router-dom').useNavigate;

describe('CategoryProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  const mockApiResponse = {
    data: {
      products: [
        {
          _id: '1',
          name: 'Test Product 1',
          price: 100,
          description: 'This is a test product description that is longer than 60 characters to test truncation',
          slug: 'test-product-1'
        },
        {
          _id: '2',
          name: 'Test Product 2',
          price: 200,
          description: 'Short description',
          slug: 'test-product-2'
        }
      ],
      category: {
        name: 'Test Category'
      }
    }
  };

  test('renders category page with products when API call succeeds', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-category' });
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Category - Test Category')).toBeInTheDocument();
    });

    expect(screen.getByText('2 result found')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  test('makes API call with correct slug parameter', async () => {
    mockUseParams.mockReturnValue({ slug: 'electronics' });
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-category/electronics');
    });
  });

  test('truncates product description to 60 characters', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-category' });
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      const truncatedText = screen.getByText(/This is a test product description that is longer than 60/);
      expect(truncatedText).toHaveTextContent('This is a test product description that is longer than 60 ch...');
    });
  });

  test('navigates to product detail when "More Details" button is clicked', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-category' });
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const moreDetailsButtons = screen.getAllByText('More Details');
    fireEvent.click(moreDetailsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/product/test-product-1');
  });

  test('renders product images with correct src and alt attributes', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-category' });
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', '/api/v1/product/product-photo/1');
      expect(images[0]).toHaveAttribute('alt', 'Test Product 1');
      expect(images[1]).toHaveAttribute('src', '/api/v1/product/product-photo/2');
      expect(images[1]).toHaveAttribute('alt', 'Test Product 2');
    });
  });

  test('handles API error gracefully', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-category' });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(new Error('API Error'));
    });

    consoleSpy.mockRestore();
  });

  test('does not make API call when slug is undefined', () => {
    mockUseParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('re-fetches products when slug parameter changes', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    // First render with electronics slug
    mockUseParams.mockReturnValue({ slug: 'electronics' });
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    rerender(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    // Change slug to clothing
    mockUseParams.mockReturnValue({ slug: 'clothing' });
    mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

    rerender(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/product-category/clothing');
    });
  });

  test('displays "0 result found" when no products are returned', async () => {
    mockUseParams.mockReturnValue({ slug: 'empty-category' });
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        products: [],
        category: { name: 'Empty Category' }
      }
    });

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('0 result found')).toBeInTheDocument();
      expect(screen.getByText('Category - Empty Category')).toBeInTheDocument();
    });
  });

  test('formats prices correctly in USD currency', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-category' });
    const responseWithDifferentPrices = {
      data: {
        products: [
          {
            _id: '1',
            name: 'Expensive Product',
            price: 1234.56,
            description: 'Test description',
            slug: 'expensive-product'
          }
        ],
        category: { name: 'Test Category' }
      }
    };
    mockedAxios.get.mockResolvedValueOnce(responseWithDifferentPrices);

    render(
      <MemoryRouter>
        <CategoryProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    });
  });
});
