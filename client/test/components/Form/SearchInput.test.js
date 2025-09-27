import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import SearchInput from '../../../src/components/Form/SearchInput';
import { useSearch } from '../../../src/context/search';
import { useNavigate } from 'react-router-dom';

jest.mock('axios');
jest.mock('../../../src/context/search');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockedAxios = axios;
const mockedUseSearch = useSearch;
const mockedUseNavigate = useNavigate;

const mockSearchData = {
  products: [
    { id: 1, name: 'Test Product 1' },
    { id: 2, name: 'Test Product 2' }
  ]
};

const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('SearchInput', () => {
  let mockNavigate;
  let mockSetValues;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock navigate function
    mockNavigate = jest.fn();
    mockedUseNavigate.mockReturnValue(mockNavigate);

    // Mock setValues function
    mockSetValues = jest.fn();

    // Mock useSearch hook with default values
    mockedUseSearch.mockReturnValue([
      { keyword: '', results: [] },
      mockSetValues
    ]);
  });

  test('renders search form with input and button', () => {
    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  test('displays current keyword value in input', () => {
    mockedUseSearch.mockReturnValue([
      { keyword: 'laptop', results: [] },
      mockSetValues
    ]);

    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('laptop')).toBeInTheDocument();
  });

  test('updates keyword when typing in input', () => {
    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'phone' } });

    expect(mockSetValues).toHaveBeenCalledWith({
      keyword: 'phone',
      results: []
    });
  });

  test('handles form submission successfully', async () => {
    mockedUseSearch.mockReturnValue([
      { keyword: 'laptop', results: [] },
      mockSetValues
    ]);

    mockedAxios.get.mockResolvedValueOnce({
      data: mockSearchData
    });

    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const form = screen.getByRole('search');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/search/laptop');
      expect(mockSetValues).toHaveBeenCalledWith({
        keyword: 'laptop',
        results: mockSearchData
      });
      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });
  });

  test('handles form submission by clicking search button', async () => {
    mockedUseSearch.mockReturnValue([
      { keyword: 'phone', results: [] },
      mockSetValues
    ]);

    mockedAxios.get.mockResolvedValueOnce({
      data: mockSearchData
    });

    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/search/phone');
      expect(mockSetValues).toHaveBeenCalledWith({
        keyword: 'phone',
        results: mockSearchData
      });
      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });
  });

  test('prevents default form submission behavior', async () => {
    const mockPreventDefault = jest.fn();

    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const form = screen.getByRole('search');

    // Create a custom event with preventDefault
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    submitEvent.preventDefault = mockPreventDefault;

    fireEvent(form, submitEvent);

    expect(mockPreventDefault).toHaveBeenCalled();
  });

  test('handles empty keyword search', async () => {
    mockedUseSearch.mockReturnValue([
      { keyword: '', results: [] },
      mockSetValues
    ]);

    mockedAxios.get.mockResolvedValueOnce({
      data: { products: [] }
    });

    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const form = screen.getByRole('search');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/product/search/');
    });
  });

  test('handles search with special characters', async () => {
    const specialKeyword = 'test@#$%';
    mockedUseSearch.mockReturnValue([
      { keyword: specialKeyword, results: [] },
      mockSetValues
    ]);

    mockedAxios.get.mockResolvedValueOnce({
      data: mockSearchData
    });

    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const form = screen.getByRole('search');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(`/api/v1/product/search/${specialKeyword}`);
    });
  });

  describe('Error handling', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test('handles network error and logs to console', async () => {
      const networkError = new Error('Network failed');

      mockedUseSearch.mockReturnValue([
        { keyword: 'laptop', results: [] },
        mockSetValues
      ]);

      mockedAxios.get.mockRejectedValueOnce(networkError);

      render(
        <TestWrapper>
          <SearchInput />
        </TestWrapper>
      );

      const form = screen.getByRole('search');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(networkError);
      });

      // Verify that setValues and navigate are not called on error
      expect(mockSetValues).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('handles 404 error', async () => {
      const notFoundError = {
        response: { status: 404, data: 'Not found' }
      };

      mockedUseSearch.mockReturnValue([
        { keyword: 'nonexistent', results: [] },
        mockSetValues
      ]);

      mockedAxios.get.mockRejectedValueOnce(notFoundError);

      render(
        <TestWrapper>
          <SearchInput />
        </TestWrapper>
      );

      const form = screen.getByRole('search');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(notFoundError);
      });
    });

    test('handles server error (500)', async () => {
      const serverError = {
        response: { status: 500, data: 'Internal server error' }
      };

      mockedUseSearch.mockReturnValue([
        { keyword: 'test', results: [] },
        mockSetValues
      ]);

      mockedAxios.get.mockRejectedValueOnce(serverError);

      render(
        <TestWrapper>
          <SearchInput />
        </TestWrapper>
      );

      const form = screen.getByRole('search');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(serverError);
      });
    });
  });

  test('maintains existing results and other values when updating keyword', () => {
    const existingValues = {
      keyword: 'old',
      results: [{ id: 1, name: 'Old Product' }],
      otherProperty: 'should be preserved'
    };

    mockedUseSearch.mockReturnValue([existingValues, mockSetValues]);

    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'new keyword' } });

    expect(mockSetValues).toHaveBeenCalledWith({
      ...existingValues,
      keyword: 'new keyword'
    });
  });

  test('has correct accessibility attributes', () => {
    render(
      <TestWrapper>
        <SearchInput />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Search');
    const form = screen.getByRole('search');

    expect(input).toHaveAttribute('aria-label', 'Search');
    expect(input).toHaveAttribute('type', 'search');
    expect(form).toHaveAttribute('role', 'search');
  });
});
