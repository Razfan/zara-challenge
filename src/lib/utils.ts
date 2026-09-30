const integerFormat = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(price: number): string {
  // Round to cents first so floating-point sums like 1228.9999... still count as integers.
  const cents = Math.round(price * 100) / 100;
  const format = Number.isInteger(cents) ? integerFormat : decimalFormat;
  return `${format.format(cents)} EUR`;
}

export type CharDiff = {
  char: string;
  /** Only on changed characters: the one it replaces, or `''` if there was none. */
  previous?: string;
};

/**
 * Compares two strings character by character aligned from the end, so the digits of
 * prices of different length ("From 1229 EUR" -> "1529 EUR") line up.
 */
export function diffChars(previous: string | undefined, current: string): CharDiff[] {
  const chars = [...current];
  if (previous === undefined) return chars.map((char) => ({ char }));

  const previousChars = [...previous];
  const offset = previousChars.length - chars.length;
  return chars.map((char, index) => {
    const replaced = previousChars[index + offset] ?? '';
    return replaced === char ? { char } : { char, previous: replaced };
  });
}

type ScrollMetrics = Pick<Element, 'scrollLeft' | 'scrollWidth' | 'clientWidth'>;

const clampFraction = (value: number) => Math.min(Math.max(value, 0), 1);

/** Horizontal scroll position as a 0-1 fraction: `scrollLeft / (scrollWidth - clientWidth)`. */
export function scrollProgress({ scrollLeft, scrollWidth, clientWidth }: ScrollMetrics): number {
  const overflow = scrollWidth - clientWidth;
  return overflow > 0 ? clampFraction(scrollLeft / overflow) : 0;
}

/** Inverse of `scrollProgress`: the `scrollLeft` for a 0-1 fraction. */
export function scrollLeftFor(
  progress: number,
  { scrollWidth, clientWidth }: Omit<ScrollMetrics, 'scrollLeft'>,
): number {
  return clampFraction(progress) * Math.max(scrollWidth - clientWidth, 0);
}
