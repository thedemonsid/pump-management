import type { BillResponse } from './bill';
import type { PaymentMethod } from './customer-bill-payment';

/**
 * Summary information for a single customer's financials
 */
export interface CustomerSummary {
  customerId: string;
  customerName: string;
  totalBills: number;
  totalPaid: number;
  balance: number;
}

/**
 * Ledger entry representing a transaction in the customer's ledger
 */
export interface LedgerEntry {
  date: string;
  action: string;
  invoiceNo: string;
  billAmount: number;
  amountPaid: number;
  balanceAmount: number;
  debtAmount: number;
  entryBy: string;
  comments: string;
  type: 'bill' | 'payment';
  billDetails?: BillResponse;
  paymentDetails?: {
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    amount: number;
  };
}

/**
 * Summary information for ledger calculations
 */
export interface LedgerSummary {
  totalBillsBefore: number;
  totalPaidBefore: number;
  totalDebtBefore: number;
  totalBillsTillDate: number;
  totalPaymentTillDate: number;
  totalDebtTillDate: number;
  totalBillsBetweenDates: number;
}

/**
 * Parameters for computing ledger data
 */
export interface ComputeLedgerParams {
  customerId: string;
  fromDate: string;
  toDate: string;
  openingBalance: number;
  pumpMasterId?: string;
}

/**
 * State for ledger store
 */
export interface LedgerState {
  ledgerData: LedgerEntry[];
  summary: LedgerSummary;
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
}
