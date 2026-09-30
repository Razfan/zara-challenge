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
