import type { Purchase } from './purchase';
import type { FuelPurchase } from './fuel-purchase';
import type { SupplierPaymentMethod } from './supplier-payment';

/**
 * Summary information for a single supplier's financials
 */
export interface SupplierSummary {
  supplierId: string;
  supplierName: string;
  totalPurchases: number;
  totalPaid: number;
  balance: number;
}

/**
 * Ledger entry representing a transaction in the supplier's ledger
 */
export interface SupplierLedgerEntry {
  date: string;
  action: string;
  invoiceNo: string;
  purchaseAmount: number;
  amountPaid: number;
  balanceAmount: number;
  debtAmount: number;
  entryBy: string;
  comments: string;
  type: 'purchase' | 'fuel-purchase' | 'payment';
  purchaseDetails?: Purchase;
  fuelPurchaseDetails?: FuelPurchase;
  paymentDetails?: {
    paymentMethod: SupplierPaymentMethod;
    referenceNumber: string;
    notes?: string;
    amount: number;
  };
}

/**
 * Summary information for supplier ledger calculations
 */
export interface SupplierLedgerSummary {
  totalPurchasesBefore: number;
  totalPaidBefore: number;
  totalDebtBefore: number;
  totalPurchasesTillDate: number;
  totalPaymentTillDate: number;
  totalDebtTillDate: number;
  totalPurchasesBetweenDates: number;
}

/**
 * Parameters for computing supplier ledger data
 */
export interface ComputeSupplierLedgerParams {
  supplierId: string;
  fromDate: string;
  toDate: string;
  openingBalance: number;
}

/**
 * State for supplier ledger store
 */
export interface SupplierLedgerState {
  ledgerData: SupplierLedgerEntry[];
  summary: SupplierLedgerSummary;
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
}
