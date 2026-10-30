/** Converts a rendered price such as "Rs. 1,000" into a number (1000). */
export function parsePrice(text: string): number {
  const digits = text.replace(/[^\d.]/g, '').replace(/^\.+|\.+$/g, '');
  const value = Number(digits);
  if (digits === '' || Number.isNaN(value)) {
    throw new Error(`Unable to parse price from "${text}"`);
  }
  return value;
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount}`;
}
