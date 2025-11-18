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
