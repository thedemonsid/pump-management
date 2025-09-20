/**
 * Formats a number as Indian Rupee currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

/**
 * Normalizes a number string by replacing problematic Unicode characters
 * that can cause rendering distortion in PDFs and displays
 * @param s - The string to normalize
 * @returns Normalized string with safe characters
 */
export function normalizeNumberString(s: string = ''): string {
  return s
    .replace(/\u00A0/g, ' ') // non‑breaking space
    .replace(/\u202F/g, ' ') // narrow no‑break space
    .replace(/\u060C/g, ',') // Arabic comma → normal comma
    .replace(/[\u200E\u200F]/g, '') // remove LRM/RLM marks
    .trim();
}
