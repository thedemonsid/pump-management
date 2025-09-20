/**
 * Formats a date string in Indian locale with time
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date-time string
 * @param dateTimeString - The date-time string to format
 * @returns Formatted date-time string
 */
export function formatDateTime(dateTimeString: string): string {
  return new Date(dateTimeString).toLocaleString();
}
