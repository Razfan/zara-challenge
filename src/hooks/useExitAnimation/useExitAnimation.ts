import { type RefObject, useEffect, useRef } from 'react';

/**
 * Calls `onDone` once the CSS animations started by `leaving` have ended, so an element
 * can fade out before it is removed from the list. Without animations to wait for
 * (reduced motion ends them at once; jsdom has no Web Animations API), right away.
 */
export function useExitAnimation(
  ref: RefObject<HTMLElement | null>,
  leaving: boolean,
  onDone: () => void,
) {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!leaving) return;
    const animations = ref.current?.getAnimations?.() ?? [];
    if (animations.length === 0) {
      onDoneRef.current();
      return;
    }

    let cancelled = false;
    Promise.all(animations.map(({ finished }) => finished)).then(
      () => {
        if (!cancelled) onDoneRef.current();
      },
      // Cancelled animation (e.g. the element went away): nothing left to finish.
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [leaving, ref]);
}
