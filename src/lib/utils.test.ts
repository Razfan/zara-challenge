import { diffChars, formatPrice, scrollLeftFor, scrollProgress } from './utils';

describe('formatPrice', () => {
  it('formats integer prices as "<n> EUR" without decimals', () => {
    expect(formatPrice(1229)).toBe('1229 EUR');
  });

  it('formats decimal prices with a comma and two decimals', () => {
    expect(formatPrice(553.31)).toBe('553,31 EUR');
    expect(formatPrice(553.3)).toBe('553,30 EUR');
  });

  it('uses es-ES grouping for large numbers', () => {
    expect(formatPrice(12999)).toBe('12.999 EUR');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0 EUR');
  });

  it('treats sums that round to an integer as integers', () => {
    expect(formatPrice(0.1 + 0.2 + 1228.7)).toBe('1229 EUR');
  });
});

describe('diffChars', () => {
  it('marks only the characters that differ, aligned from the end', () => {
    expect(diffChars('1199 EUR', '1599 EUR')).toEqual([
      { char: '1' },
      { char: '5', previous: '1' },
      { char: '9' },
      { char: '9' },
      { char: ' ' },
      { char: 'E' },
      { char: 'U' },
      { char: 'R' },
    ]);
  });

  it('aligns numbers of different length by their last digit', () => {
    expect(diffChars('From 1229 EUR', '1529 EUR').slice(0, 4)).toEqual([
      { char: '1' },
      { char: '5', previous: '2' },
      { char: '2' },
      { char: '9' },
    ]);
  });

  it('marks new leading characters as changed without a previous one', () => {
    expect(diffChars('999 EUR', '1229 EUR').slice(0, 2)).toEqual([
      { char: '1', previous: '' },
      { char: '2', previous: '9' },
    ]);
  });

  it('marks nothing without a previous value', () => {
    expect(diffChars(undefined, '12')).toEqual([{ char: '1' }, { char: '2' }]);
  });
});

describe('scrollProgress', () => {
  it('is 0 at the start and 1 at the end of the scroll', () => {
    expect(scrollProgress({ scrollLeft: 0, scrollWidth: 2000, clientWidth: 1000 })).toBe(0);
    expect(scrollProgress({ scrollLeft: 1000, scrollWidth: 2000, clientWidth: 1000 })).toBe(1);
  });

  it('is the scrolled fraction of the overflow', () => {
    expect(scrollProgress({ scrollLeft: 250, scrollWidth: 2000, clientWidth: 1000 })).toBe(0.25);
  });

  it('is 0 when the content does not overflow', () => {
    expect(scrollProgress({ scrollLeft: 0, scrollWidth: 800, clientWidth: 1000 })).toBe(0);
  });

  it('stays within 0 and 1 during overscroll (Safari bounce)', () => {
    expect(scrollProgress({ scrollLeft: -40, scrollWidth: 2000, clientWidth: 1000 })).toBe(0);
    expect(scrollProgress({ scrollLeft: 1040, scrollWidth: 2000, clientWidth: 1000 })).toBe(1);
  });

  it('converts a fraction back to a scroll position, clamped to the overflow', () => {
    const metrics = { scrollWidth: 2000, clientWidth: 1000 };

    expect(scrollLeftFor(0.25, metrics)).toBe(250);
    expect(scrollLeftFor(1.5, metrics)).toBe(1000);
    expect(scrollLeftFor(0.5, { scrollWidth: 800, clientWidth: 1000 })).toBe(0);
  });
});
