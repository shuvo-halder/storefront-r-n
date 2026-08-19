export function formatPrice(
  amount: number,
  currency: string = 'BDT',
  currencySymbol?: string
): string {
  const defaultSymbol = currency === 'BDT' ? '৳' : '$';
  const symbol = currencySymbol || defaultSymbol;

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
