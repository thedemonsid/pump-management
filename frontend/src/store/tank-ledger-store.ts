import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { TankTransactionService } from "@/services/tank-transaction-service";
import type {
  TankLedgerEntry,
  TankLedgerSummary,
  TankLedgerState,
  ComputeTankLedgerParams,
} from "@/types/tank-transaction";

interface TankLedgerStore extends TankLedgerState {
  // Actions
  setLedgerData: (ledgerData: TankLedgerEntry[]) => void;
  setSummary: (summary: TankLedgerSummary) => void;
  setLoading: (loading: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computation methods
  computeLedgerData: (params: ComputeTankLedgerParams) => Promise<void>;

  // Optimized method to get only the current level
  getCurrentLevel: (params: {
    tankId: string;
    fromDate: string;
    toDate: string;
  }) => Promise<number>;
}

const initialState: TankLedgerState = {
  ledgerData: [],
  summary: {
    openingLevel: 0,
    totalAdditionsBefore: 0,
    totalRemovalsBefore: 0,
    levelBefore: 0,
    totalAdditionsInRange: 0,
    totalRemovalsInRange: 0,
    closingLevel: 0,
    totalAdditionsTillDate: 0,
    totalRemovalsTillDate: 0,
  },
  loading: false,
  hasSearched: false,
  error: null,
};

export const useTankLedgerStore = create<TankLedgerStore>()(
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
        tankId,
        fromDate,
        toDate,
        openingLevel,
      }: ComputeTankLedgerParams) => {
        set({ loading: true, error: null });

        try {
          // Calculate the date one day before fromDate for "before" calculations
          const beforeDate = new Date(fromDate);
          beforeDate.setDate(beforeDate.getDate() - 1);
          const beforeDateString = beforeDate.toISOString().split("T")[0];

          // Fetch opening level for the day before from date
          const levelBefore = await TankTransactionService.getOpeningLevel(
            tankId,
            beforeDateString
          );

          // Fetch transactions for the date range
          const transactions =
            await TankTransactionService.getTransactionsWithDateRange(
              tankId,
              fromDate,
              toDate
            );

          // Create ledger entries for the date range
          const ledgerEntries: TankLedgerEntry[] = [];

          // Add transactions in date range (backend already filters them)
          transactions.forEach((transaction) => {
            ledgerEntries.push({
              date: transaction.transactionDate,
              action:
                transaction.transactionType === "ADDITION"
                  ? "Addition"
                  : "Removal",
              volume: transaction.volume,
              type:
                transaction.transactionType === "ADDITION"
                  ? "addition"
                  : "removal",
              level: 0, // Will be calculated later
              description: transaction.description,
              supplierName: transaction.supplierName,
              invoiceNumber: transaction.invoiceNumber,
              entryBy: transaction.entryBy || "System",
              transactionDetails: transaction,
            });
          });

          // Sort by date
          ledgerEntries.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Calculate running levels starting from levelBefore
          let runningLevel = levelBefore;
          ledgerEntries.forEach((entry) => {
            if (entry.type === "addition") {
              runningLevel += entry.volume;
            } else if (entry.type === "removal") {
              runningLevel -= entry.volume;
            }
            entry.level = runningLevel;
          });

          // Compute summary
          const totalAdditionsInRange = ledgerEntries
            .filter((entry) => entry.type === "addition")
            .reduce((sum, entry) => sum + entry.volume, 0);
          const totalRemovalsInRange = ledgerEntries
            .filter((entry) => entry.type === "removal")
            .reduce((sum, entry) => sum + entry.volume, 0);
          const closingLevel = runningLevel;

          // For now, we'll use the in-range totals as till-date totals
          // In a full implementation, you'd fetch all transactions
          const totalAdditionsTillDate = totalAdditionsInRange;
          const totalRemovalsTillDate = totalRemovalsInRange;

          const summary: TankLedgerSummary = {
            openingLevel,
            totalAdditionsBefore: Math.max(0, levelBefore - openingLevel), // Approximate additions before
            totalRemovalsBefore: Math.max(0, openingLevel - levelBefore), // Approximate removals before
            levelBefore,
            totalAdditionsInRange,
            totalRemovalsInRange,
            closingLevel,
            totalAdditionsTillDate,
            totalRemovalsTillDate,
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
              : "Failed to compute tank ledger data";
          toast.error(errorMessage);
          set({ error: errorMessage, loading: false });
        }
      },

      getCurrentLevel: async ({ tankId, fromDate, toDate }) => {
        try {
          // Calculate the date one day before fromDate for "before" calculations
          const beforeDate = new Date(fromDate);
          beforeDate.setDate(beforeDate.getDate() - 1);
          const beforeDateString = beforeDate.toISOString().split("T")[0];

          // Fetch opening level for the day before from date
          const levelBefore = await TankTransactionService.getOpeningLevel(
            tankId,
            beforeDateString
          );

          // Fetch transactions for the date range
          const transactions =
            await TankTransactionService.getTransactionsWithDateRange(
              tankId,
              fromDate,
              toDate
            );

          // Calculate current level by applying transactions to levelBefore
          let currentLevel = levelBefore;
          transactions.forEach((transaction) => {
            if (transaction.transactionType === "ADDITION") {
              currentLevel += transaction.volume;
            } else if (transaction.transactionType === "REMOVAL") {
              currentLevel -= transaction.volume;
            }
          });

          return Math.max(0, currentLevel); // Ensure non-negative
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to get current level";
          console.error(errorMessage, error);
          throw error;
        }
      },
    }),
    {
      name: "tank-ledger-store",
    }
  )
);
