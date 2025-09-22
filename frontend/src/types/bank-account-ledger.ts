import type { BankTransaction } from './bank-account';

/**
 * Ledger entry representing a transaction in the bank account's ledger
 */
export interface BankAccountLedgerEntry {
  date: string;
  action: string;
  reference: string;
  credit: number;
  debit: number;
  balance: number;
  entryBy: string;
  description: string;
  type: 'credit' | 'debit';
  transactionDetails: BankTransaction;
}

/**
 * Summary information for bank account ledger calculations
 */
export interface BankAccountLedgerSummary {
  openingBalance: number;
  totalCreditsBefore: number;
  totalDebitsBefore: number;
  balanceBefore: number;
  totalCreditsInRange: number;
  totalDebitsInRange: number;
  closingBalance: number;
  totalCreditsTillDate: number;
  totalDebitsTillDate: number;
}

/**
 * Parameters for computing bank account ledger data
 */
export interface ComputeBankAccountLedgerParams {
  bankAccountId: string;
  fromDate: string;
  toDate: string;
  openingBalance: number;
}

/**
 * State for bank account ledger store
 */
export interface BankAccountLedgerState {
  ledgerData: BankAccountLedgerEntry[];
  summary: BankAccountLedgerSummary;
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
}
