import { formatPrice } from './utils';

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
