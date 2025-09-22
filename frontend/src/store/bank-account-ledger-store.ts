import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import { BankAccountService } from '@/services/bank-account-service';
import type {
  BankAccountLedgerEntry,
  BankAccountLedgerSummary,
  BankAccountLedgerState,
  ComputeBankAccountLedgerParams,
} from '@/types/bank-account-ledger';

interface BankAccountLedgerStore extends BankAccountLedgerState {
  // Actions
  setLedgerData: (ledgerData: BankAccountLedgerEntry[]) => void;
  setSummary: (summary: BankAccountLedgerSummary) => void;
  setLoading: (loading: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computation methods
  computeLedgerData: (params: ComputeBankAccountLedgerParams) => Promise<void>;
}

const initialState: BankAccountLedgerState = {
  ledgerData: [],
  summary: {
    openingBalance: 0,
    totalCreditsBefore: 0,
    totalDebitsBefore: 0,
    balanceBefore: 0,
    totalCreditsInRange: 0,
    totalDebitsInRange: 0,
    closingBalance: 0,
    totalCreditsTillDate: 0,
    totalDebitsTillDate: 0,
  },
  loading: false,
  hasSearched: false,
  error: null,
};

export const useBankAccountLedgerStore = create<BankAccountLedgerStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setLedgerData: (ledgerData) => set({ ledgerData }),
      setSummary: (summary) => set({ summary }),
      setLoading: (loading) => set({ loading }),
      setHasSearched: (hasSearched) => set({ hasSearched }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),

      computeLedgerData: async ({
        bankAccountId,
        fromDate,
        toDate,
        openingBalance,
      }: ComputeBankAccountLedgerParams) => {
        set({ loading: true, error: null });

        try {
          // Fetch opening balance for the from date
          const balanceBefore = await BankAccountService.getOpeningBalance(
            bankAccountId,
            fromDate
          );

          // Fetch transactions for the date range
          const transactions =
            await BankAccountService.getTransactionsWithDateRange(
              bankAccountId,
              fromDate,
              toDate
            );

          // Create ledger entries for the date range
          const ledgerEntries: BankAccountLedgerEntry[] = [];

          // Add transactions in date range (backend already filters them)
          transactions.forEach((transaction) => {
            ledgerEntries.push({
              date: transaction.transactionDate!,
              action:
                transaction.transactionType === 'CREDIT' ? 'Credit' : 'Debit',
              reference: transaction.description,
              credit:
                transaction.transactionType === 'CREDIT'
                  ? transaction.amount
                  : 0,
              debit:
                transaction.transactionType === 'DEBIT'
                  ? transaction.amount
                  : 0,
              balance: 0, // Will be calculated later
              entryBy: 'System',
              description: transaction.description,
              type:
                transaction.transactionType === 'CREDIT' ? 'credit' : 'debit',
              transactionDetails: transaction,
            });
          });

          // Sort by date
          ledgerEntries.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Calculate running balances starting from balanceBefore
          let runningBalance = balanceBefore;
          ledgerEntries.forEach((entry) => {
            if (entry.type === 'credit') {
              runningBalance += entry.credit;
            } else if (entry.type === 'debit') {
              runningBalance -= entry.debit;
            }
            entry.balance = runningBalance;
          });

          // Compute summary
          const totalCreditsInRange = ledgerEntries.reduce(
            (sum, entry) => sum + entry.credit,
            0
          );
          const totalDebitsInRange = ledgerEntries.reduce(
            (sum, entry) => sum + entry.debit,
            0
          );
          const closingBalance = runningBalance;

          // For now, we'll use the in-range totals as till-date totals
          // In a full implementation, you'd fetch all transactions
          const totalCreditsTillDate = totalCreditsInRange;
          const totalDebitsTillDate = totalDebitsInRange;

          const summary: BankAccountLedgerSummary = {
            openingBalance,
            totalCreditsBefore: Math.max(0, balanceBefore - openingBalance), // Approximate credits before
            totalDebitsBefore: Math.max(0, openingBalance - balanceBefore), // Approximate debits before
            balanceBefore,
            totalCreditsInRange,
            totalDebitsInRange,
            closingBalance,
            totalCreditsTillDate,
            totalDebitsTillDate,
          };

          set({
            ledgerData: ledgerEntries,
            summary,
            hasSearched: true,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to compute bank account ledger data';
          toast.error(errorMessage);
          set({ error: errorMessage, loading: false });
        }
      },
    }),
    {
      name: 'bank-account-ledger-store',
    }
  )
);
