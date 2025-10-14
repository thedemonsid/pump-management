import { format } from "date-fns";

/**
 * Format a number as Indian currency (INR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

/**
 * Format fuel quantity with 3 decimal places and unit
 */
export function formatFuelQuantity(quantity: number): string {
  return `${quantity.toFixed(3)} L`;
}

/**
 * Format date to yyyy-MM-dd
 */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get date that is N days prior to today
 */
export function getDaysPrior(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get default start date (2 days prior)
 */
export function getDefaultStartDate(): string {
  return formatDate(getDaysPrior(2));
}

/**
 * Get today's date formatted
 */
export function getTodayFormatted(): string {
  return formatDate(new Date());
}
