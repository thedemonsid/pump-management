import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import { EmployeeLedgerService } from "@/services/employee-ledger-service";
import type {
  EmployeeLedgerEntry,
  EmployeeLedgerSummary,
  EmployeeLedgerState,
  ComputeEmployeeLedgerParams,
} from "@/types/employee-ledger";

interface EmployeeLedgerStore extends EmployeeLedgerState {
  // Actions
  setLedgerData: (ledgerData: EmployeeLedgerEntry[]) => void;
  setSummary: (summary: EmployeeLedgerSummary) => void;
  setLoading: (loading: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computation methods
  computeLedgerData: (params: ComputeEmployeeLedgerParams) => Promise<void>;

  // Optimized method to get only the current balance
  getCurrentBalance: (params: {
    userId: string;
    asOfDate: string;
  }) => Promise<number>;
}

const initialState: EmployeeLedgerState = {
  ledgerData: [],
  summary: {
    openingBalance: 0,
    totalSalariesBefore: 0,
    totalPaymentsBefore: 0,
    balanceBefore: 0,
    totalSalariesInRange: 0,
    totalPaymentsInRange: 0,
    totalSalariesTillDate: 0,
    totalPaymentsTillDate: 0,
    closingBalance: 0,
  },
  loading: false,
  hasSearched: false,
  error: null,
};

export const useEmployeeLedgerStore = create<EmployeeLedgerStore>()(
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
        userId,
        fromDate,
        toDate,
      }: ComputeEmployeeLedgerParams) => {
        // Clear previous data before fetching new data
        set({
          loading: true,
          error: null,
          ledgerData: [],
          hasSearched: false,
        });

        try {
          // Fetch ledger data from the backend
          const response = await EmployeeLedgerService.getEmployeeLedger(
            userId,
            fromDate,
            toDate
          );

          // Update state with the response
          set({
            ledgerData: response.ledgerEntries,
            summary: response.summary,
            loading: false,
            hasSearched: true,
            error: null,
          });
        } catch (error) {
          console.error("Failed to compute ledger data:", error);

          const err = error as { message?: string };
          let errorMessage = "Failed to load ledger data. Please try again.";

          if (err.message) {
            const match = err.message.match(/^\d+:\s*(.+)$/);
            if (match && match[1]) {
              errorMessage = match[1];
            } else {
              errorMessage = err.message;
            }
          }

          set({
            loading: false,
            error: errorMessage,
          });

          toast.error(errorMessage);
        }
      },

      getCurrentBalance: async ({ userId, asOfDate }) => {
        try {
          const balance = await EmployeeLedgerService.getCurrentBalance(
            userId,
            asOfDate
          );
          return balance;
        } catch (error) {
          console.error("Failed to get current balance:", error);
          return 0;
        }
      },
    }),
    {
      name: "employee-ledger-store",
    }
  )
);
