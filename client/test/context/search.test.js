import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SearchProvider, useSearch } from '../../src/context/search';

// Test component that uses the search context
const TestConsumer = () => {
  const [searchState, setSearchState] = useSearch();

  return (
    <div>
      <div data-testid="keyword">{searchState.keyword}</div>
      <div data-testid="results">{JSON.stringify(searchState.results)}</div>
      <button
        data-testid="update-keyword"
        onClick={() => setSearchState({ ...searchState, keyword: 'new keyword' })}
      >
        Update Keyword
      </button>
      <button
        data-testid="update-results"
        onClick={() => setSearchState({ 
          ...searchState, 
          results: [{ id: 1, name: 'Test Product' }] 
        })}
      >
        Update Results
      </button>
      <button
        data-testid="reset"
        onClick={() => setSearchState({ keyword: '', results: [] })}
      >
        Reset
      </button>
    </div>
  );
};

// Test component for multiple consumers
const MultipleConsumers = () => {
  return (
    <>
      <TestConsumer />
      <div data-testid="second-consumer">
        <SecondConsumer />
      </div>
    </>
  );
};

const SecondConsumer = () => {
  const [searchState] = useSearch();
  return (
    <div data-testid="second-keyword">{searchState.keyword}</div>
  );
};

describe('SearchContext', () => {
  describe('SearchProvider', () => {
    test('renders children correctly', () => {
      render(
        <SearchProvider>
          <div data-testid="child">Test Child</div>
        </SearchProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    test('provides initial search state', () => {
      render(
        <SearchProvider>
          <TestConsumer />
        </SearchProvider>
      );

      expect(screen.getByTestId('keyword')).toHaveTextContent('');
      expect(screen.getByTestId('results')).toHaveTextContent('[]');
    });

    test('allows updating keyword state', () => {
      render(
        <SearchProvider>
          <TestConsumer />
        </SearchProvider>
      );

      expect(screen.getByTestId('keyword')).toHaveTextContent('');

      act(() => {
        fireEvent.click(screen.getByTestId('update-keyword'));
      });

      expect(screen.getByTestId('keyword')).toHaveTextContent('new keyword');
    });

    test('allows updating results state', () => {
      render(
        <SearchProvider>
          <TestConsumer />
        </SearchProvider>
      );

      expect(screen.getByTestId('results')).toHaveTextContent('[]');

      act(() => {
        fireEvent.click(screen.getByTestId('update-results'));
      });

      expect(screen.getByTestId('results')).toHaveTextContent(
        JSON.stringify([{ id: 1, name: 'Test Product' }])
      );
    });

    test('allows resetting state', () => {
      render(
        <SearchProvider>
          <TestConsumer />
        </SearchProvider>
      );

      // First update the state
      act(() => {
        fireEvent.click(screen.getByTestId('update-keyword'));
      });

      act(() => {
        fireEvent.click(screen.getByTestId('update-results'));
      });

      expect(screen.getByTestId('keyword')).toHaveTextContent('new keyword');
      expect(screen.getByTestId('results')).not.toHaveTextContent('[]');

      // Then reset
      act(() => {
        fireEvent.click(screen.getByTestId('reset'));
      });

      expect(screen.getByTestId('keyword')).toHaveTextContent('');
      expect(screen.getByTestId('results')).toHaveTextContent('[]');
    });

    test('shares state between multiple consumers', () => {
      render(
        <SearchProvider>
          <MultipleConsumers />
        </SearchProvider>
      );

      expect(screen.getByTestId('keyword')).toHaveTextContent('');
      expect(screen.getByTestId('second-keyword')).toHaveTextContent('');

      act(() => {
        fireEvent.click(screen.getByTestId('update-keyword'));
      });

      expect(screen.getByTestId('keyword')).toHaveTextContent('new keyword');
      expect(screen.getByTestId('second-keyword')).toHaveTextContent('new keyword');
    });
  });

  describe('useSearch hook', () => {
    test('returns array with state and setState function', () => {
      let searchHookResult;

      const TestComponent = () => {
        searchHookResult = useSearch();
        return <div>Test</div>;
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      expect(Array.isArray(searchHookResult)).toBe(true);
      expect(searchHookResult).toHaveLength(2);
      expect(typeof searchHookResult[0]).toBe('object');
      expect(typeof searchHookResult[1]).toBe('function');
    });

    test('returns correct initial state structure', () => {
      let searchState;

      const TestComponent = () => {
        [searchState] = useSearch();
        return <div>Test</div>;
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      expect(searchState).toEqual({
        keyword: '',
        results: []
      });
    });

    test('setState function updates state correctly', () => {
      let searchState;
      let setSearchState;

      const TestComponent = () => {
        [searchState, setSearchState] = useSearch();
        return (
          <div>
            <span data-testid="current-keyword">{searchState.keyword}</span>
            <button
              data-testid="set-keyword"
              onClick={() => setSearchState({ keyword: 'test', results: [] })}
            >
              Set Keyword
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <TestComponent />
        </SearchProvider>
      );

      expect(screen.getByTestId('current-keyword')).toHaveTextContent('');

      act(() => {
        fireEvent.click(screen.getByTestId('set-keyword'));
      });

      expect(screen.getByTestId('current-keyword')).toHaveTextContent('test');
    });
  });

  describe('Complex state updates', () => {
    test('handles complex results array', () => {
      const ComplexTestConsumer = () => {
        const [searchState, setSearchState] = useSearch();

        const updateWithComplexResults = () => {
          setSearchState({
            keyword: 'complex search',
            results: [
              { id: 1, name: 'Product 1', price: 100 },
              { id: 2, name: 'Product 2', price: 200 },
              { id: 3, name: 'Product 3', price: 300 }
            ]
          });
        };

        return (
          <div>
            <div data-testid="keyword">{searchState.keyword}</div>
            <div data-testid="results-count">{searchState.results.length}</div>
            <button 
              data-testid="update-complex"
              onClick={updateWithComplexResults}
            >
              Update Complex
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <ComplexTestConsumer />
        </SearchProvider>
      );

      expect(screen.getByTestId('results-count')).toHaveTextContent('0');

      act(() => {
        fireEvent.click(screen.getByTestId('update-complex'));
      });

      expect(screen.getByTestId('keyword')).toHaveTextContent('complex search');
      expect(screen.getByTestId('results-count')).toHaveTextContent('3');
    });

    test('handles partial state updates', () => {
      const PartialUpdateConsumer = () => {
        const [searchState, setSearchState] = useSearch();

        return (
          <div>
            <div data-testid="keyword">{searchState.keyword}</div>
            <div data-testid="results">{JSON.stringify(searchState.results)}</div>
            <button 
              data-testid="update-keyword-only"
              onClick={() => setSearchState({
                ...searchState,
                keyword: 'updated keyword'
              })}
            >
              Update Keyword Only
            </button>
            <button 
              data-testid="update-results-only"
              onClick={() => setSearchState({
                ...searchState,
                results: [{ id: 1, name: 'New Result' }]
              })}
            >
              Update Results Only
            </button>
          </div>
        );
      };

      render(
        <SearchProvider>
          <PartialUpdateConsumer />
        </SearchProvider>
      );

      // Update only keyword
      act(() => {
        fireEvent.click(screen.getByTestId('update-keyword-only'));
      });

      expect(screen.getByTestId('keyword')).toHaveTextContent('updated keyword');
      expect(screen.getByTestId('results')).toHaveTextContent('[]');

      // Update only results
      act(() => {
        fireEvent.click(screen.getByTestId('update-results-only'));
      });

      expect(screen.getByTestId('keyword')).toHaveTextContent('updated keyword');
      expect(screen.getByTestId('results')).toHaveTextContent(
        JSON.stringify([{ id: 1, name: 'New Result' }])
      );
    });
  });
});
