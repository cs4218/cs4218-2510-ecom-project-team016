import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from '../../src/pages/ProductDetails';

jest.mock('axios');
jest.mock('../../src/components/Layout', () => {
  return ({ children }) => <div data-testid="layout">{children}</div>;
});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

const mockedAxios = axios;
const mockNavigate = jest.fn();
const mockUseParams = require('react-router-dom').useParams;
const mockUseNavigate = require('react-router-dom').useNavigate;

describe('ProductDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
  });

  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: {
      _id: 'cat1',
      name: 'Test Category'
    }
  };

  const mockRelatedProducts = [
    {
      _id: '2',
      name: 'Related Product 1',
      description: 'Related product description that is longer than 60 characters to test truncation',
      price: 49.99,
      slug: 'related-product-1'
    },
    {
      _id: '3',
      name: 'Related Product 2',
      description: 'Short description',
      price: 79.99,
      slug: 'related-product-2'
    }
  ];

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    );
  };

  test('renders without crashing', () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get.mockResolvedValue({ data: { product: mockProduct } });

    renderComponent();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('fetches and displays product details when slug is provided', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument();
      expect(screen.getByText(/Name : Test Product/)).toBeInTheDocument();
      expect(screen.getByText(/Description : Test Description/)).toBeInTheDocument();
      expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
      expect(screen.getByText(/Category : Test Category/)).toBeInTheDocument();
    });
  });

  test('calls getProduct API with correct slug', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: [] } });

    renderComponent();

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/get-product/test-product');
    });
  });

  test('calls getSimilarProduct API after getting product', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    renderComponent();

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/related-product/1/cat1');
    });
  });

  test('displays related products when available', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Similar Products ➡️')).toBeInTheDocument();
      expect(screen.getByText('Related Product 1')).toBeInTheDocument();
      expect(screen.getByText('Related Product 2')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('$79.99')).toBeInTheDocument();
    });
  });

  test('displays "No Similar Products found" when no related products', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: [] } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No Similar Products found')).toBeInTheDocument();
    });
  });

  test('truncates long descriptions in related products', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Related product description that is longer than 60 character\.\.\./)).toBeInTheDocument();
    });
  });

  test('navigates to product detail page when "More Details" button is clicked', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    renderComponent();

    await waitFor(() => {
      const moreDetailsButtons = screen.getAllByText('More Details');
      fireEvent.click(moreDetailsButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/product/related-product-1');
    });
  });

  test('does not fetch product when no slug is provided', () => {
    mockUseParams.mockReturnValue({});

    renderComponent();

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('handles API errors gracefully', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get.mockRejectedValue(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    renderComponent();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('displays product image with correct src', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: [] } });

    renderComponent();

    await waitFor(() => {
      const productImage = screen.getByAltText('Test Product');
      expect(productImage).toHaveAttribute('src', '/api/v1/product/product-photo/1');
    });
  });

  test('renders ADD TO CART button', async () => {
    mockUseParams.mockReturnValue({ slug: 'test-product' });
    mockedAxios.get
      .mockResolvedValueOnce({ data: { product: mockProduct } })
      .mockResolvedValueOnce({ data: { products: [] } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('ADD TO CART')).toBeInTheDocument();
    });
  });
});
