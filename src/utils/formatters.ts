export function formatPrice(
  amount: number,
  currency: string = 'BDT',
  currencySymbol?: string
): string {
  const safeAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
  // Storefront requirement: BDT is the canonical currency (৳)
  const symbol = (currencySymbol && currencySymbol !== '$') ? currencySymbol : '৳';

  return `${symbol}${safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
