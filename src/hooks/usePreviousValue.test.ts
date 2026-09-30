import { renderHook } from '@testing-library/react';
import { usePreviousValue } from './usePreviousValue';

describe('usePreviousValue', () => {
  it('returns undefined until the value changes', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: 'a' },
    });

    expect(result.current).toBeUndefined();
    rerender({ value: 'a' });
    expect(result.current).toBeUndefined();
  });

  it('returns the value before the last change, across unrelated renders', () => {
    const { result, rerender } = renderHook(({ value }) => usePreviousValue(value), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    expect(result.current).toBe('a');
    rerender({ value: 'b' });
    expect(result.current).toBe('a');
    rerender({ value: 'c' });
    expect(result.current).toBe('b');
  });
});
