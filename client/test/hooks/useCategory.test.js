import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import useCategory from '../../src/hooks/useCategory';

// Mock axios
jest.mock('axios');

describe('useCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty categories array', () => {
    const { result } = renderHook(() => useCategory());
    expect(result.current).toEqual([]);
  });

  it('should fetch and set categories on mount', async () => {
    const mockCategories = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Books' }
    ];

    axios.get.mockResolvedValueOnce({
      data: { category: mockCategories }
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual(mockCategories);
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const mockError = new Error('API Error');

    axios.get.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    });

    expect(result.current).toEqual([]);

    consoleLogSpy.mockRestore();
  });

  it('should handle undefined data gracefully', async () => {
    axios.get.mockResolvedValueOnce({
      data: undefined
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(result.current).toEqual([]);
  });

  it('should handle missing category property in response', async () => {
    axios.get.mockResolvedValueOnce({
      data: { someOtherProperty: 'value' }
    });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(result.current).toEqual([]);
  });
});
