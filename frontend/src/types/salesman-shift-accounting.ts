/**
 * Response DTO for Salesman Shift Accounting information
 */
export interface SalesmanShiftAccountingResponse {
  /** Unique identifier */
  id: string;
  /** Salesman Shift ID */
  shiftId: string;
  /** Fuel sales amount (calculated from nozzles) */
  fuelSales: number;
  /** Customer receipt (calculated from bill payments) */
  customerReceipt: number;
  /** System received amount (fuel sales + customer receipt) */
  systemReceivedAmount: number;
  /** UPI received amount */
  upiReceived: number;
  /** Card received amount */
  cardReceived: number;
  /** Fleet card received amount */
  fleetCardReceived: number;
  /** Credit amount (calculated from credit bills) */
  credit: number;
  /** Expenses amount (calculated from shift expenses) */
  expenses: number;
  /** Opening cash given to salesman at shift start */
  openingCash: number;
  /** Cash in hand */
  cashInHand: number;
  /** Balance amount (expected cash - actual cash) */
  balanceAmount: number;
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
  /** Fleet card received amount */
  fleetCardReceived: number;
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
  /** Fleet card received amount */
  fleetCardReceived?: number;
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

// ==================== CASH DISTRIBUTION TYPES ====================

/**
 * Single distribution item for a bank account
 */
export interface DistributionItem {
  /** Bank account ID */
  bankAccountId: string;
  /** Amount to distribute */
  amount: number;
  /** Payment method (CASH, UPI, RTGS, NEFT, IMPS, CHEQUE, CARD, FLEET_CARD) */
  paymentMethod:
    | "CASH"
    | "UPI"
    | "RTGS"
    | "NEFT"
    | "IMPS"
    | "CHEQUE"
    | "CARD"
    | "FLEET_CARD";
}

/**
 * Request DTO for distributing cash from shift accounting to bank accounts
 */
export interface CashDistributionRequest {
  /** List of distributions */
  distributions: DistributionItem[];
}

/**
 * Response DTO for cash distribution transaction
 */
export interface CashDistributionResponse {
  /** Transaction ID */
  id: string;
  /** Bank account ID */
  bankAccountId: string;
  /** Bank account holder name */
  bankAccountName: string;
  /** Bank name */
  bankName: string;
  /** Account number */
  accountNumber: string;
  /** Distributed amount */
  amount: number;
  /** Payment method (CASH, UPI, RTGS, NEFT, IMPS, CHEQUE, CARD, FLEET_CARD) */
  paymentMethod:
    | "CASH"
    | "UPI"
    | "RTGS"
    | "NEFT"
    | "IMPS"
    | "CHEQUE"
    | "CARD"
    | "FLEET_CARD";
  /** Transaction date */
  transactionDate: string;
  /** Entry by user */
  entryBy: string;
  /** Creation timestamp */
  createdAt: string;
}
