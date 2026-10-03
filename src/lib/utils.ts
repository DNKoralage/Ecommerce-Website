export function formatPrice(
  amount: number,
  symbol?: string
): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return symbol ? `${symbol}0` : 'Rs. 0';
  }

  // Check if international patron preferred USD in client storage
  if (typeof window !== 'undefined') {
    try {
      const pref = localStorage.getItem('ceylon_currency_pref');
      if (pref === 'USD') {
        const usd = amount / 300;
        return `$${usd.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
    } catch {}
  }

  const prefix = symbol !== undefined ? symbol : 'Rs. ';
  return `${prefix}${amount.toLocaleString('en-LK')}`;
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
