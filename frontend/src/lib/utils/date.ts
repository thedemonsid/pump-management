import { subDays } from "date-fns";

/**
 * Formats a date string in Indian locale with time
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

/**
 * Get date from 7 days ago
 * @returns Date object from 7 days ago
 */
export function getOneWeekAgo(): Date {
  return subDays(new Date(), 7);
}

/**
 * Get today's date
 * @returns Date object for today
 */
export function getToday(): Date {
  return new Date();
}

/**
 * Get start of current month
 * @returns Date object for first day of current month
 */
export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get start of current financial year (April 1st of current FY)
 * Financial year in India runs from April 1st to March 31st
 * @returns Date object for April 1st of the current financial year
 */
export function getStartOfLastFinancialYear(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 3 = April)

  // If current month is before April (Jan-Mar), current FY started last year
  // If current month is April or after, current FY started this year
  const currentFYYear = currentMonth < 3 ? currentYear - 1 : currentYear;

  // Return April 1st of current financial year
  return new Date(currentFYYear, 3, 1); // Month 3 = April (0-indexed)
}
