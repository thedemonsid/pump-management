/**
 * Response DTO for Salesman Shift Accounting information
 */
export interface SalesmanShiftAccountingResponse {
  /** Unique identifier */
  id: string;
  /** Salesman Shift ID */
  shiftId: string;
  /** Fuel sales amount */
  fuelSales: number;
  /** Customer receipt (cash from customers) */
  customerReceipt: number;
  /** System received amount (fuel sales + customer receipt) */
  systemReceivedAmount: number;
  /** UPI received amount */
  upiReceived: number;
  /** Card received amount */
  cardReceived: number;
  /** Credit amount */
  credit: number;
  /** Expenses amount */
  expenses: number;
  /** Expense reason */
  expenseReason?: string;
  /** Cash in hand */
  cashInHand: number;
  /** Balance amount (expected cash - actual cash) */
  balanceAmount: number;
  /** Number of 2000 rupees notes */
  notes2000: number;
  /** Number of 1000 rupees notes */
  notes1000: number;
  /** Number of 500 rupees notes */
  notes500: number;
  /** Number of 200 rupees notes */
  notes200: number;
  /** Number of 100 rupees notes */
  notes100: number;
  /** Number of 50 rupees notes */
  notes50: number;
  /** Number of 20 rupees notes */
  notes20: number;
  /** Number of 10 rupees notes */
  notes10: number;
  /** Number of 5 rupees coins */
  coins5: number;
  /** Number of 2 rupees coins */
  coins2: number;
  /** Number of 1 rupee coins */
  coins1: number;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Version number */
  version: number;
}

/**
 * Request DTO for creating a new salesman shift accounting
 */
export interface CreateSalesmanShiftAccountingRequest {
  /** UPI received amount */
  upiReceived: number;
  /** Card received amount */
  cardReceived: number;
  /** Expenses amount */
  expenses: number;
  /** Expense reason */
  expenseReason?: string;
  /** Number of 2000 rupees notes */
  notes2000?: number;
  /** Number of 1000 rupees notes */
  notes1000?: number;
  /** Number of 500 rupees notes */
  notes500?: number;
  /** Number of 200 rupees notes */
  notes200?: number;
  /** Number of 100 rupees notes */
  notes100?: number;
  /** Number of 50 rupees notes */
  notes50?: number;
  /** Number of 20 rupees notes */
  notes20?: number;
  /** Number of 10 rupees notes */
  notes10?: number;
  /** Number of 5 rupees coins */
  coins5?: number;
  /** Number of 2 rupees coins */
  coins2?: number;
  /** Number of 1 rupee coins */
  coins1?: number;
}

/**
 * Request DTO for updating an existing salesman shift accounting
 */
export interface UpdateSalesmanShiftAccountingRequest {
  /** UPI received amount */
  upiReceived?: number;
  /** Card received amount */
  cardReceived?: number;
  /** Expenses amount */
  expenses?: number;
  /** Expense reason */
  expenseReason?: string;
  /** Number of 2000 rupees notes */
  notes2000?: number;
  /** Number of 1000 rupees notes */
  notes1000?: number;
  /** Number of 500 rupees notes */
  notes500?: number;
  /** Number of 200 rupees notes */
  notes200?: number;
  /** Number of 100 rupees notes */
  notes100?: number;
  /** Number of 50 rupees notes */
  notes50?: number;
  /** Number of 20 rupees notes */
  notes20?: number;
  /** Number of 10 rupees notes */
  notes10?: number;
  /** Number of 5 rupees coins */
  coins5?: number;
  /** Number of 2 rupees coins */
  coins2?: number;
  /** Number of 1 rupee coins */
  coins1?: number;
}
