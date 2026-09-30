'use client';

import {
  createContext,
  useMemo,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from 'react';

export type NavigationProgress = {
  /** True while a navigation started with `startTransition` is pending. */
  isPending: boolean;
  startTransition: TransitionStartFunction;
};

export const NavigationProgressContext = createContext<NavigationProgress | null>(null);

/**
 * UI-only state shared between whoever navigates (e.g. SearchBar) and LoadingBar.
 * Owning the transition here avoids mirroring a local `isPending` through an effect.
 */
export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const value = useMemo(() => ({ isPending, startTransition }), [isPending]);

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
    </NavigationProgressContext.Provider>
  );
}
