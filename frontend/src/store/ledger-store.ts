import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import type {
  CustomerBillPaymentResponse,
  Customer,
  BillResponse,
} from '@/types';
import { BillService } from '@/services/bill-service';
import { CustomerBillPaymentService } from '@/services/customer-bill-payment-service';
import { SalesmanBillService } from '@/services/salesman-bill-service';
import { SalesmanBillPaymentService } from '@/services/salesman-bill-payment-service';
import type {
  LedgerEntry,
  LedgerSummary,
  LedgerState,
  ComputeLedgerParams,
  CustomerSummary,
} from '@/types/ledger';

interface LedgerStore extends LedgerState {
  // Actions
  setLedgerData: (ledgerData: LedgerEntry[]) => void;
  setSummary: (summary: LedgerSummary) => void;
  setLoading: (loading: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computation methods
  computeLedgerData: (params: ComputeLedgerParams) => Promise<void>;
  computeCustomerSummaries: (
    customers: Customer[],
    bills: BillResponse[],
    payments: CustomerBillPaymentResponse[]
  ) => CustomerSummary[];
}

const initialState: LedgerState = {
  ledgerData: [],
  summary: {
    totalBillsBefore: 0,
    totalPaidBefore: 0,
    totalDebtBefore: 0,
    totalBillsTillDate: 0,
    totalPaymentTillDate: 0,
    totalDebtTillDate: 0,
    totalBillsBetweenDates: 0,
  },
  loading: false,
  hasSearched: false,
  error: null,
};

export const useLedgerStore = create<LedgerStore>()(
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
        customerId,
        fromDate,
        toDate,
        openingBalance,
        pumpMasterId,
      }: ComputeLedgerParams) => {
        set({ loading: true, error: null });

        try {
          // Fetch bills, salesman bills, and payments for the customer
          const [bills, salesmanBills, payments, salesmanPayments] =
            await Promise.all([
              BillService.getByCustomerId(customerId),
              SalesmanBillService.getByCustomer(customerId),
              CustomerBillPaymentService.getByCustomerId(
                customerId,
                pumpMasterId
              ),
              SalesmanBillPaymentService.getByCustomerId(
                customerId,
                pumpMasterId
              ),
            ]);

          // Create a map of billId to payments (from both bill-embedded payments and standalone payments)
          const billPaymentsMap: Record<string, CustomerBillPaymentResponse[]> =
            {};
          bills.forEach((bill) => {
            if (bill.payments && bill.payments.length > 0) {
              billPaymentsMap[bill.id] = bill.payments;
            } else {
              billPaymentsMap[bill.id] = [];
            }
          });

          // Add standalone payments to the map if they have a billId, avoiding duplicates
          payments.forEach((payment) => {
            if (payment.billId) {
              if (!billPaymentsMap[payment.billId]) {
                billPaymentsMap[payment.billId] = [];
              }
              // Check if payment is already in the array to avoid duplicates
              const exists = billPaymentsMap[payment.billId].some(
                (p) => p.id === payment.id
              );
              if (!exists) {
                billPaymentsMap[payment.billId].push(payment);
              }
            }
          });

          // Calculate before date summaries
          const beforeDate = new Date(fromDate);
          beforeDate.setHours(0, 0, 0, 0); // Start of day
          const endDate = new Date(toDate);
          endDate.setHours(23, 59, 59, 999); // End of day
          const totalBillsBefore = bills
            .filter((b) => new Date(b.billDate) < beforeDate)
            .reduce((sum, b) => sum + b.netAmount, 0);

          const totalSalesmanBillsBefore = salesmanBills
            .filter((b) => new Date(b.billDate) < beforeDate)
            .reduce((sum, b) => sum + b.amount, 0);

          const totalPaidBefore = payments
            .filter((p) => new Date(p.paymentDate) < beforeDate)
            .reduce((sum, p) => sum + p.amount, 0);

          const totalSalesmanPaidBefore = salesmanPayments
            .filter((p) => new Date(p.paymentDate) < beforeDate)
            .reduce((sum, p) => sum + p.amount, 0);

          const totalDebtBefore =
            openingBalance +
            totalBillsBefore +
            totalSalesmanBillsBefore -
            (totalPaidBefore + totalSalesmanPaidBefore);

          // Create ledger entries for the date range
          const ledgerEntries: LedgerEntry[] = [];

          // Add bills (with integrated payments)
          const billsInRange = bills.filter((b) => {
            const billDate = new Date(b.billDate);
            return billDate >= beforeDate && billDate <= endDate;
          });

          billsInRange.forEach((bill) => {
            const billPayments = billPaymentsMap[bill.id] || [];
            const totalPaymentAmount = billPayments.reduce(
              (sum, p) => sum + p.amount,
              0
            );

            ledgerEntries.push({
              date: bill.billDate,
              action: 'Bill',
              invoiceNo: bill.billNo.toString(),
              billAmount: bill.netAmount,
              amountPaid: totalPaymentAmount,
              balanceAmount: 0, // Will be calculated later
              debtAmount: 0, // Will be calculated later
              entryBy: 'System',
              comments: `Bill - ${bill.customerName || 'Customer'}`,
              type: 'bill',
              billDetails: bill,
            });
          });

          // Add salesman bills
          const salesmanBillsInRange = salesmanBills.filter((bill) => {
            const billDate = new Date(bill.billDate);
            return billDate >= beforeDate && billDate <= endDate;
          });

          salesmanBillsInRange.forEach((bill) => {
            ledgerEntries.push({
              date: bill.billDate,
              action: 'Salesman Bill',
              invoiceNo: bill.billNo.toString(),
              billAmount: bill.amount,
              amountPaid: 0, // Salesman bills don't have integrated payments in this context
              balanceAmount: 0, // Will be calculated later
              debtAmount: 0, // Will be calculated later
              entryBy: 'System',
              comments: `Salesman Bill - ${bill.productName || 'Fuel'} (${
                bill.quantity
              }L)`,
              type: 'bill',
              billDetails: {
                id: bill.id,
                pumpMasterId: '', // Will be set from context if needed
                billNo: bill.billNo,
                billDate: bill.billDate,
                customerId: bill.customerId,
                customerName: bill.customerName,
                billType: 'SALESMAN',
                rateType: 'EXCLUDING_GST',
                totalAmount: bill.amount,
                discountAmount: 0,
                taxAmount: 0,
                netAmount: bill.amount,
                vehicleNo: bill.vehicleNo,
                driverName: bill.driverName,
                createdAt: bill.createdAt,
                updatedAt: bill.updatedAt,
                billItems: [
                  {
                    id: bill.id + '-item',
                    billId: bill.id,
                    productId: bill.productId,
                    productName: bill.productName,
                    quantity: bill.quantity,
                    rate: bill.rate,
                    amount: bill.amount,
                    discount: 0,
                    discountAmount: 0,
                    taxPercentage: 0,
                    taxAmount: 0,
                    netAmount: bill.amount,
                    totalAmount: bill.amount,
                  },
                ],
              },
            });
          });

          // Add standalone payments (not linked to bills)
          const standalonePayments = payments.filter((p) => {
            const paymentDate = new Date(p.paymentDate);
            return (
              paymentDate >= beforeDate && paymentDate <= endDate && !p.billId
            );
          });

          standalonePayments.forEach((payment) => {
            ledgerEntries.push({
              date: payment.paymentDate,
              action: 'Payment',
              invoiceNo: payment.referenceNumber || '',
              billAmount: 0,
              amountPaid: payment.amount,
              balanceAmount: 0,
              debtAmount: 0,
              entryBy: 'System',
              comments: `${payment.paymentMethod} - ${payment.notes || ''}`,
              type: 'payment',
              paymentDetails: {
                paymentMethod: payment.paymentMethod,
                referenceNumber: payment.referenceNumber,
                notes: payment.notes,
                amount: payment.amount,
              },
            });
          });

          // Add salesman bill payments
          const salesmanPaymentsInRange = salesmanPayments.filter((p) => {
            const paymentDate = new Date(p.paymentDate);
            return paymentDate >= beforeDate && paymentDate <= endDate;
          });

          salesmanPaymentsInRange.forEach((payment) => {
            ledgerEntries.push({
              date: payment.paymentDate,
              action: 'Salesman Payment',
              invoiceNo: payment.referenceNumber || '',
              billAmount: 0,
              amountPaid: payment.amount,
              balanceAmount: 0,
              debtAmount: 0,
              entryBy: 'System',
              comments: `Salesman Payment - ${payment.paymentMethod} - ${
                payment.notes || ''
              }`,
              type: 'payment',
            });
          });

          // Sort by date
          ledgerEntries.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          // Calculate running balances
          let runningBalance = totalDebtBefore;
          ledgerEntries.forEach((entry) => {
            if (entry.type === 'bill') {
              runningBalance += entry.billAmount - entry.amountPaid;
            } else if (entry.type === 'payment') {
              runningBalance -= entry.amountPaid;
            }
            entry.balanceAmount = runningBalance;
            entry.debtAmount = runningBalance;
          });

          // Compute summary
          const totalBillsTillDate =
            totalBillsBefore +
            totalSalesmanBillsBefore +
            ledgerEntries.reduce((sum, entry) => sum + entry.billAmount, 0);
          const totalPaymentTillDate =
            totalPaidBefore +
            totalSalesmanPaidBefore +
            ledgerEntries.reduce((sum, entry) => sum + entry.amountPaid, 0);
          const totalDebtTillDate =
            openingBalance +
            totalBillsBefore +
            totalSalesmanBillsBefore -
            (totalPaidBefore + totalSalesmanPaidBefore) +
            ledgerEntries.reduce(
              (sum, entry) => sum + entry.billAmount - entry.amountPaid,
              0
            );
          const totalBillsBetweenDates = ledgerEntries.reduce(
            (sum, entry) => sum + entry.billAmount,
            0
          );

          const summary: LedgerSummary = {
            totalBillsBefore,
            totalPaidBefore,
            totalDebtBefore,
            totalBillsTillDate,
            totalPaymentTillDate,
            totalDebtTillDate,
            totalBillsBetweenDates,
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
              : 'Failed to compute ledger data';
          toast.error(errorMessage);
          set({ error: errorMessage, loading: false });
        }
      },

      computeCustomerSummaries: (
        customers: Customer[],
        bills: BillResponse[],
        payments: CustomerBillPaymentResponse[]
      ) => {
        return customers.map((customer) => {
          const customerBills = bills.filter(
            (b) => b.customerId === customer.id
          );
          const customerPayments = payments.filter(
            (p) => p.customerId === customer.id
          );

          const totalBills = customerBills.reduce(
            (sum, b) => sum + b.netAmount,
            0
          );
          const totalPaid = customerPayments.reduce(
            (sum, p) => sum + p.amount,
            0
          );
          const balance =
            (customer.openingBalance || 0) + totalBills - totalPaid;

          return {
            customerId: customer.id,
            customerName: customer.customerName,
            totalBills,
            totalPaid,
            balance,
          };
        });
      },
    }),
    {
      name: 'ledger-store',
    }
  )
);
