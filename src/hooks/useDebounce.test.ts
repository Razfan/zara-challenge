import { act, renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns the initial value straight away', () => {
    const { result } = renderHook(() => useDebounce('sam', 300));

    expect(result.current).toBe('sam');
  });

  it('updates only after 300 ms without changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'sam' });
    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('');

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('sam');
  });

  it('restarts the wait on every change and keeps only the last value', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 's' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'sa' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'sam' });
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('');

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('sam');
  });

  it('clears the pending timer on unmount', () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'sam' });
    unmount();

    expect(jest.getTimerCount()).toBe(0);
  });
});
