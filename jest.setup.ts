import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// jsdom has no IntersectionObserver: next/link would fall back to a requestIdleCallback
// prefetch that updates state after the test ends (act warning). A no-op observer keeps it idle.
class NoopIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
// Guarded: suites under `@jest-environment node` have no window.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: NoopIntersectionObserver,
  });
}
