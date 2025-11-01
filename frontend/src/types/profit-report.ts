/**
 * Profit Report Types for Fuel Pump Management System
 *
 * Profit calculation focuses on fuel sales:
 * Revenue = Fuel sales (bills with fuel products)
 * Cost = Fuel purchases + Operating expenses
 * Profit = Revenue - Cost
 */

export interface FuelProfitBreakdown {
  /** Total revenue from fuel sales */
  fuelSalesRevenue: number;
  /** Total fuel purchases cost */
  fuelPurchasesCost: number;
  /** Total operating expenses */
  operatingExpenses: number;
  /** Gross profit (Revenue - Purchase Cost) */
  grossProfit: number;
  /** Net profit (Gross Profit - Operating Expenses) */
  netProfit: number;
  /** Profit margin percentage */
  profitMargin: number;
}

export interface FuelMetrics {
  /** Total fuel quantity sold (in liters) */
  totalFuelSold: number;
  /** Total fuel quantity purchased (in liters) */
  totalFuelPurchased: number;
  /** Average selling price per liter */
  averageSellingPrice: number;
  /** Average purchase price per liter */
  averagePurchasePrice: number;
  /** Number of fuel bills generated */
  fuelBillsCount: number;
  /** Number of fuel purchases made */
  fuelPurchasesCount: number;
}

export interface ProductWiseProfit {
  /** Product ID */
  productId: string;
  /** Product name (e.g., Petrol, Diesel) */
  productName: string;
  /** Product type (should be FUEL for profit reports) */
  productType: string;
  /** Sales revenue for this product */
  salesRevenue: number;
  /** Purchase cost for this product */
  purchaseCost: number;
  /** Profit for this product */
  profit: number;
  /** Quantity sold */
  quantitySold: number;
  /** Quantity purchased */
  quantityPurchased: number;
  /** Average selling price */
  avgSellingPrice: number;
  /** Average purchase price */
  avgPurchasePrice: number;
}

export interface ExpenseBreakdown {
  /** Expense head ID */
  expenseHeadId: string;
  /** Expense head name */
  expenseHeadName: string;
  /** Total expense amount */
  amount: number;
  /** Number of expense entries */
  count: number;
}

export interface ProfitReport {
  /** Period type: DAY, MONTH, or YEAR */
  periodType: "DAY" | "MONTH" | "YEAR";
  /** Start date of the period */
  startDate: string;
  /** End date of the period */
  endDate: string;
  /** Fuel profit breakdown */
  fuelProfitBreakdown: FuelProfitBreakdown;
  /** Fuel metrics */
  fuelMetrics: FuelMetrics;
  /** Product-wise profit (for each fuel type) */
  productWiseProfit: ProductWiseProfit[];
  /** Expense breakdown by category */
  expenseBreakdown: ExpenseBreakdown[];
  /** Report generated timestamp */
  generatedAt: string;
}

export interface ProfitReportRequest {
  /** Period type: DAY, MONTH, or YEAR */
  periodType: "DAY" | "MONTH" | "YEAR";
  /** Specific date for the report (YYYY-MM-DD format) */
  date?: string;
}

export type ProfitReportResponse = ProfitReport;
