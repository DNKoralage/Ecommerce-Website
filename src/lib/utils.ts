export function formatPrice(
  amount: number,
  symbol: string = 'Rs. '
): string {
  if (typeof amount !== 'number' || isNaN(amount)) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('en-LK')}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function calculateDiscountPercentage(original: number, sale: number): number {
  if (!original || !sale || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
