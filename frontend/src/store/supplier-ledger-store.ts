import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import type {
  Supplier,
  Purchase,
  FuelPurchase,
  SupplierPaymentResponse,
} from "@/types";
import { PurchaseService } from "@/services/purchase-service";
import { FuelPurchaseService } from "@/services/fuel-purchase-service";
import { SupplierPaymentService } from "@/services/supplier-payment-service";
import type {
  SupplierLedgerEntry,
  SupplierLedgerSummary,
  SupplierLedgerState,
  ComputeSupplierLedgerParams,
  SupplierSummary,
} from "@/types/supplier-ledger";

interface SupplierLedgerStore extends SupplierLedgerState {
  // Actions
  setLedgerData: (ledgerData: SupplierLedgerEntry[]) => void;
  setSummary: (summary: SupplierLedgerSummary) => void;
  setLoading: (loading: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computation methods
  computeLedgerData: (params: ComputeSupplierLedgerParams) => Promise<void>;
  computeSupplierSummaries: (
    suppliers: Supplier[],
    purchases: Purchase[],
    fuelPurchases: FuelPurchase[],
    payments: SupplierPaymentResponse[]
  ) => SupplierSummary[];
}

const initialState: SupplierLedgerState = {
  ledgerData: [],
  summary: {
    totalPurchasesBefore: 0,
    totalPaidBefore: 0,
    totalDebtBefore: 0,
    totalPurchasesTillDate: 0,
    totalPaymentTillDate: 0,
    totalDebtTillDate: 0,
    totalPurchasesBetweenDates: 0,
  },
  loading: false,
  hasSearched: false,
  error: null,
};

export const useSupplierLedgerStore = create<SupplierLedgerStore>()(
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
        supplierId,
        fromDate,
        toDate,
        openingBalance,
      }: ComputeSupplierLedgerParams) => {
        set({ loading: true, error: null });

        try {
          // Fetch purchases, fuel purchases and payments
          const [purchases, fuelPurchases, payments] = await Promise.all([
            PurchaseService.getAll(),
            FuelPurchaseService.getAll(),
            SupplierPaymentService.getAll(),
          ]);
          console.log({
            purchases,
            fuelPurchases,
            payments,
          }); // --- IGNORE ---
          // Filter data for this supplier
          const supplierPurchases = purchases.filter(
            (p) => p.supplierId === supplierId
          );
          const supplierFuelPurchases = fuelPurchases.filter(
            (fp) => fp.supplierId === supplierId
          );
          const supplierPayments = payments.filter(
            (sp) => sp.supplierId === supplierId
          );

          // Calculate before date summaries
          const beforeDate = new Date(fromDate);
          beforeDate.setHours(0, 0, 0, 0); // Start of day
          const endDate = new Date(toDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          const totalPurchasesBefore =
            supplierPurchases
              .filter((p) => new Date(p.purchaseDate) < beforeDate)
              .reduce((sum, p) => sum + (p.netAmount || 0), 0) +
            supplierFuelPurchases
              .filter((fp) => new Date(fp.purchaseDate) < beforeDate)
              .reduce((sum, fp) => sum + fp.amount, 0);

          const totalPaidBefore = supplierPayments
            .filter((sp) => new Date(sp.paymentDate) < beforeDate)
            .reduce((sum, sp) => sum + sp.amount, 0);

          const totalDebtBefore =
            totalPurchasesBefore + openingBalance - totalPaidBefore;

          // Create ledger entries for the date range
          const ledgerEntries: SupplierLedgerEntry[] = [];

          // Add purchases (with new structure containing purchaseItems array)
          supplierPurchases
            .filter((p) => {
              const purchaseDate = new Date(p.purchaseDate);
              return purchaseDate >= beforeDate && purchaseDate <= endDate;
            })
            .forEach((purchase) => {
              // Get product names from purchaseItems array
              const productNames = purchase.purchaseItems
                .map((item) => item.productName)
                .join(", ");

              ledgerEntries.push({
                date: purchase.purchaseDate,
                action: "Purchase",
                invoiceNo: purchase.invoiceNumber,
                purchaseAmount: purchase.netAmount || 0,
                amountPaid: 0,
                balanceAmount: 0, // Will be calculated later
                debtAmount: 0, // Will be calculated later
                entryBy: "System",
                comments: `Purchase - ${productNames || "Multiple Items"}`,
                type: "purchase",
                purchaseDetails: purchase,
              });
            });

          // Add fuel purchases
          supplierFuelPurchases
            .filter((fp) => {
              const purchaseDate = new Date(fp.purchaseDate);
              return purchaseDate >= beforeDate && purchaseDate <= endDate;
            })
            .forEach((fuelPurchase) => {
              ledgerEntries.push({
                date: fuelPurchase.purchaseDate,
                action: "Fuel Purchase",
                invoiceNo: fuelPurchase.invoiceNumber,
                purchaseAmount: fuelPurchase.amount,
                amountPaid: 0,
                balanceAmount: 0,
                debtAmount: 0,
                entryBy: "System",
                comments: `Fuel Purchase - ${fuelPurchase.productName}`,
                type: "fuel-purchase",
                fuelPurchaseDetails: fuelPurchase,
              });
            });

          // Add payments
          supplierPayments
            .filter((sp) => {
              const paymentDate = new Date(sp.paymentDate);
              return paymentDate >= beforeDate && paymentDate <= endDate;
            })
            .forEach((payment) => {
              ledgerEntries.push({
                date: payment.paymentDate,
                action: "Payment",
                invoiceNo: payment.referenceNumber,
                purchaseAmount: 0,
                amountPaid: payment.amount,
                balanceAmount: 0,
                debtAmount: 0,
                entryBy: "System",
                comments: `${payment.paymentMethod} - ${payment.notes || ""}`,
                type: "payment",
                paymentDetails: {
                  paymentMethod: payment.paymentMethod,
                  referenceNumber: payment.referenceNumber,
                  notes: payment.notes,
                  amount: payment.amount,
                },
              });
            });

          // Sort by date
          ledgerEntries.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Calculate running balances
          let runningBalance = totalDebtBefore;
          ledgerEntries.forEach((entry) => {
            if (entry.type === "purchase" || entry.type === "fuel-purchase") {
              runningBalance += entry.purchaseAmount;
            } else if (entry.type === "payment") {
              runningBalance -= entry.amountPaid;
            }
            entry.balanceAmount = runningBalance;
            entry.debtAmount = runningBalance;
          });

          // Compute summary
          const totalPurchasesTillDate =
            totalPurchasesBefore +
            ledgerEntries.reduce((sum, entry) => sum + entry.purchaseAmount, 0);
          const totalPaymentTillDate =
            totalPaidBefore +
            ledgerEntries.reduce((sum, entry) => sum + entry.amountPaid, 0);
          const totalDebtTillDate =
            openingBalance +
            totalPurchasesBefore -
            totalPaidBefore +
            ledgerEntries.reduce(
              (sum, entry) => sum + entry.purchaseAmount - entry.amountPaid,
              0
            );
          const totalPurchasesBetweenDates = ledgerEntries.reduce(
            (sum, entry) => sum + entry.purchaseAmount,
            0
          );

          const summary: SupplierLedgerSummary = {
            totalPurchasesBefore,
            totalPaidBefore,
            totalDebtBefore,
            totalPurchasesTillDate,
            totalPaymentTillDate,
            totalDebtTillDate,
            totalPurchasesBetweenDates,
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
              : "Failed to compute supplier ledger data";
          toast.error(errorMessage);
          set({ error: errorMessage, loading: false });
        }
      },

      computeSupplierSummaries: (
        suppliers: Supplier[],
        purchases: Purchase[],
        fuelPurchases: FuelPurchase[],
        payments: SupplierPaymentResponse[]
      ) => {
        return suppliers.map((supplier) => {
          const supplierPurchases = purchases.filter(
            (p) => p.supplierId === supplier.id
          );
          const supplierFuelPurchases = fuelPurchases.filter(
            (fp) => fp.supplierId === supplier.id
          );
          const supplierPayments = payments.filter(
            (p) => p.supplierId === supplier.id
          );

          const totalPurchases =
            supplierPurchases.reduce((sum, p) => sum + (p.netAmount || 0), 0) +
            supplierFuelPurchases.reduce((sum, fp) => sum + fp.amount, 0);
          const totalPaid = supplierPayments.reduce(
            (sum, p) => sum + p.amount,
            0
          );
          const balance =
            (supplier.openingBalance || 0) + totalPurchases - totalPaid;

          return {
            supplierId: supplier.id!,
            supplierName: supplier.supplierName,
            totalPurchases,
            totalPaid,
            balance,
          };
        });
      },
    }),
    {
      name: "supplier-ledger-store",
    }
  )
);
