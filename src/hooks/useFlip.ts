import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';

type Positions = Map<string, { x: number; y: number }>;

// Fallbacks for the `--duration-slow` and `--easing` tokens.
const DEFAULT_DURATION_MS = 600;
const DEFAULT_EASING = 'ease-out';

/**
 * Layout position of every child relative to the container: offsets ignore scrolling and
 * running transforms, so a measure taken mid-animation is still the real layout.
 */
function measure(container: HTMLElement, ids: readonly string[]): Positions {
  const positions: Positions = new Map();
  [...container.children].forEach((child, index) => {
    const id = ids[index];
    if (id === undefined || !(child instanceof HTMLElement)) return;
    const ownParent = child.offsetParent === container;
    positions.set(id, {
      x: child.offsetLeft - (ownParent ? 0 : container.offsetLeft),
      y: child.offsetTop - (ownParent ? 0 : container.offsetTop),
    });
  });
  return positions;
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * FLIP animation of a list whose items change: when `ids` change, the items that stay
 * slide from their old position to the new one and the new items fade in. `ids` must
 * follow the order of the container's children. Transform and opacity only, started from
 * JS because CSS cannot animate a change of grid position.
 */
export function useFlip(containerRef: RefObject<HTMLElement | null>, ids: readonly string[]) {
  const positions = useRef<Positions>(new Map());
  const idsRef = useRef(ids);
  const idsKey = ids.join('\n');

  // Before paint: compare with the last layout and play the difference back to zero.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const currentIds = idsKey === '' ? [] : idsKey.split('\n');
    idsRef.current = currentIds;
    const previous = positions.current;
    const next = measure(container, currentIds);
    positions.current = next;

    // First render, no Web Animations API (jsdom) or reduced motion: no animation.
    if (previous.size === 0 || typeof container.animate !== 'function') return;
    if (prefersReducedMotion()) return;

    const style = getComputedStyle(container);
    const options: KeyframeAnimationOptions = {
      duration: parseFloat(style.getPropertyValue('--duration-slow')) || DEFAULT_DURATION_MS,
      easing: style.getPropertyValue('--easing').trim() || DEFAULT_EASING,
    };

    [...container.children].forEach((child, index) => {
      const id = currentIds[index];
      const to = id === undefined ? undefined : next.get(id);
      if (!(child instanceof HTMLElement) || !to || id === undefined) return;
      const from = previous.get(id);
      if (!from) {
        child.animate([{ opacity: 0 }, { opacity: 1 }], options);
        return;
      }
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      if (dx === 0 && dy === 0) return;
      child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], options);
    });
  }, [containerRef, idsKey]);

  // The layout also changes without new ids (resizing the window): keep it up to date.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      positions.current = measure(container, idsRef.current);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);
}
