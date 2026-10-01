import { useState } from 'react';

/**
 * The value before its last change (not before the last render), for animating
 * from the old value to the new one. `undefined` until the first change.
 */
export function usePreviousValue<T>(value: T): T | undefined {
  const [state, setState] = useState<{ value: T; previous?: T }>({ value });
  if (!Object.is(state.value, value)) {
    // Adjusting state while rendering: React re-renders before committing.
    setState({ value, previous: state.value });
    return state.value;
  }
  return state.previous;
}
