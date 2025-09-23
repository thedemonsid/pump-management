import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  BillResponse,
  CreateBillRequest,
  UpdateBillRequest,
  BillItemResponse,
  CreateBillItemRequest,
} from '@/types';
import { BillService } from '@/services';
import { toast } from 'sonner';

interface BillState {
  bills: BillResponse[];
  dateRangeBills: BillResponse[];
  loading: boolean;
  error: string | null;
  nextBillNo: number | null;
  startDate: string;
  endDate: string;
  selectedCustomerId: string;
  billsPageStartDate: string;
  billsPageEndDate: string;
  // Actions
  setBills: (bills: BillResponse[]) => void;
  setDateRangeBills: (bills: BillResponse[]) => void;
  addBill: (bill: BillResponse) => void;
  updateBill: (id: string, bill: Partial<BillResponse>) => void;
  deleteBill: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNextBillNo: (billNo: number | null) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSelectedCustomerId: (id: string) => void;
  setBillsPageStartDate: (date: string) => void;
  setBillsPageEndDate: (date: string) => void;

  // Computed
  getFilteredDateRangeBills: () => BillResponse[];

  // API methods
  fetchBills: () => Promise<void>;
  fetchBillById: (id: string) => Promise<BillResponse>;
  fetchBillsByPumpMasterId: () => Promise<void>;
  fetchBillsByCustomerId: (customerId: string) => Promise<void>;
  fetchBillsByDateRange: () => Promise<void>;
  getNextBillNo: () => Promise<number>;
  createBill: (bill: CreateBillRequest) => Promise<void>;
  editBill: (id: string, bill: UpdateBillRequest) => Promise<void>;
  removeBill: (id: string) => Promise<void>;
  deleteBillItem: (billItemId: string) => Promise<void>;
  createBillItem: (
    billId: string,
    billItem: CreateBillItemRequest
  ) => Promise<BillItemResponse>;
  updateBillItem: (
    billItemId: string,
    billItem: CreateBillItemRequest
  ) => Promise<BillItemResponse>;
}

export const useBillStore = create<BillState>()(
  devtools(
    (set, get) => ({
      bills: [],
      dateRangeBills: [],
      loading: false,
      error: null,
      startDate: (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
      })(),
      endDate: new Date().toISOString().split('T')[0],
      selectedCustomerId: 'all-customers',
      billsPageStartDate: (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
      })(),
      billsPageEndDate: new Date().toISOString().split('T')[0],

      setBills: (bills) => set({ bills }),

      setDateRangeBills: (dateRangeBills) => set({ dateRangeBills }),

      addBill: (bill) => {
        set((state) => ({
          bills: [...state.bills, bill],
        }));
      },

      updateBill: (id, billUpdate) => {
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === id ? { ...bill, ...billUpdate } : bill
          ),
        }));
      },

      deleteBill: (id) => {
        set((state) => ({
          bills: state.bills.filter((bill) => bill.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setNextBillNo: (nextBillNo) => set({ nextBillNo }),
      setStartDate: (startDate) => set({ startDate }),
      setEndDate: (endDate) => set({ endDate }),
      setSelectedCustomerId: (selectedCustomerId) =>
        set({ selectedCustomerId }),
      setBillsPageStartDate: (billsPageStartDate) =>
        set({ billsPageStartDate }),
      setBillsPageEndDate: (billsPageEndDate) => set({ billsPageEndDate }),

      getFilteredDateRangeBills: () => {
        const state = get();
        return state.selectedCustomerId &&
          state.selectedCustomerId !== 'all-customers'
          ? state.dateRangeBills.filter(
              (bill) => bill.customerId === state.selectedCustomerId
            )
          : state.dateRangeBills;
      },

      // API methods using backend
      fetchBills: async () => {
        set({ loading: true, error: null });
        try {
          const bills = await BillService.getAll();
          console.log('Bills : ', bills);
          set({ bills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch bills';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      fetchBillById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const bill = await BillService.getById(id);
          set({ loading: false });
          return bill;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch bill';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      fetchBillsByPumpMasterId: async () => {
        set({ loading: true, error: null });
        try {
          const bills = await BillService.getByPumpMasterId();
          set({ bills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch bills by pump master';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchBillsByCustomerId: async (customerId: string) => {
        set({ loading: true, error: null });
        try {
          const bills = await BillService.getByCustomerId(customerId);
          console.log('Customer Bills : ', bills);
          set({ bills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch bills by customer';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchBillsByDateRange: async () => {
        const state = get();
        set({ loading: true, error: null });
        try {
          const bills = await BillService.getByDateRange(
            state.startDate,
            state.endDate
          );
          set({ dateRangeBills: bills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch bills by date range';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      getNextBillNo: async () => {
        try {
          const result = await BillService.getNextBillNo();
          set({ nextBillNo: result });
          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to get next bill number';
          set({ error: errorMessage });
          throw error;
        }
      },

      createBill: async (bill) => {
        set({ loading: true, error: null });
        try {
          const newBill = await BillService.create(bill);

          set((state) => ({
            bills: [...state.bills, newBill],
            loading: false,
          }));
          toast.success('Bill created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create bill';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editBill: async (id, billUpdate) => {
        set({ loading: true, error: null });
        try {
          const updatedBill = await BillService.update(id, billUpdate);

          set((state) => ({
            bills: state.bills.map((bill) =>
              bill.id === id ? updatedBill : bill
            ),
            loading: false,
          }));
          toast.success('Bill updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update bill';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeBill: async (id) => {
        set({ loading: true, error: null });
        try {
          await BillService.delete(id);

          set((state) => ({
            bills: state.bills.filter((bill) => bill.id !== id),
            loading: false,
          }));
          toast.success('Bill deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete bill';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteBillItem: async (billItemId: string) => {
        set({ loading: true, error: null });
        try {
          await BillService.deleteBillItem(billItemId);
          // Note: This might require updating the bill in the store
          // For now, we'll just show success
          set({ loading: false });
          toast.success('Bill item deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete bill item';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      createBillItem: async (
        billId: string,
        billItem: CreateBillItemRequest
      ) => {
        set({ loading: true, error: null });
        try {
          const newBillItem = await BillService.createBillItem(
            billId,
            billItem
          );
          // Update the bill in the store to include the new item
          set((state) => ({
            bills: state.bills.map((bill) =>
              bill.id === billId
                ? { ...bill, billItems: [...bill.billItems, newBillItem] }
                : bill
            ),
            loading: false,
          }));
          toast.success('Bill item created successfully');
          return newBillItem;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to create bill item';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateBillItem: async (
        billItemId: string,
        billItem: CreateBillItemRequest
      ) => {
        set({ loading: true, error: null });
        try {
          const updatedBillItem = await BillService.updateBillItem(
            billItemId,
            billItem
          );
          // Update the bill item in the store
          set((state) => ({
            bills: state.bills.map((bill) => ({
              ...bill,
              billItems: bill.billItems.map((item) =>
                item.id === billItemId ? updatedBillItem : item
              ),
            })),
            loading: false,
          }));
          toast.success('Bill item updated successfully');
          return updatedBillItem;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to update bill item';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'bill-store',
    }
  )
);
