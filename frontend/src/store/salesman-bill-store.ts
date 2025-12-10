import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  SalesmanBillResponse,
  CreateSalesmanBillRequest,
  UpdateSalesmanBillRequest,
} from "@/types";
import { SalesmanBillService } from "@/services";
import { toast } from "sonner";

interface SalesmanBillState {
  bills: SalesmanBillResponse[];
  customerBills: SalesmanBillResponse[];
  loading: boolean;
  error: string | null;
  nextBillNo: number | null;

  // Actions
  setBills: (bills: SalesmanBillResponse[]) => void;
  setCustomerBills: (bills: SalesmanBillResponse[]) => void;
  addBill: (bill: SalesmanBillResponse) => void;
  updateBillInStore: (id: string, bill: Partial<SalesmanBillResponse>) => void;
  deleteBill: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNextBillNo: (billNo: number | null) => void;

  // API methods
  fetchBills: () => Promise<void>;
  fetchBillById: (id: string) => Promise<SalesmanBillResponse>;
  fetchBillsByPumpMaster: () => Promise<void>;
  fetchBillsByCustomerId: (customerId: string, limit?: number) => Promise<void>;
  fetchBillsByDateRange: (startDate: string, endDate: string) => Promise<void>;
  getNextBillNo: () => Promise<number>;
  createBill: (
    bill: CreateSalesmanBillRequest
  ) => Promise<SalesmanBillResponse>;
  updateBill: (
    id: string,
    bill: UpdateSalesmanBillRequest
  ) => Promise<SalesmanBillResponse>;
  removeBill: (id: string) => Promise<void>;
}

const initialState = {
  bills: [],
  customerBills: [],
  loading: false,
  error: null,
  nextBillNo: null,
};

export const useSalesmanBillStore = create<SalesmanBillState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setBills: (bills) => set({ bills }),
      setCustomerBills: (customerBills) => set({ customerBills }),
      addBill: (bill) =>
        set((state) => ({
          bills: [...state.bills, bill],
          customerBills:
            bill.customerId === get().customerBills[0]?.customerId
              ? [...state.customerBills, bill]
              : state.customerBills,
        })),
      updateBillInStore: (id, updatedBill) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === id ? { ...bill, ...updatedBill } : bill
          ),
          customerBills: state.customerBills.map((bill) =>
            bill.id === id ? { ...bill, ...updatedBill } : bill
          ),
        })),
      deleteBill: (id) =>
        set((state) => ({
          bills: state.bills.filter((bill) => bill.id !== id),
          customerBills: state.customerBills.filter((bill) => bill.id !== id),
        })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setNextBillNo: (nextBillNo) => set({ nextBillNo }),

      fetchBills: async () => {
        set({ loading: true, error: null });
        try {
          const bills = await SalesmanBillService.getAll();
          set({ bills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch bills";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchBillById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const bill = await SalesmanBillService.getById(id);
          set({ loading: false });
          return bill;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch bill";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchBillsByPumpMaster: async () => {
        set({ loading: true, error: null });
        try {
          const bills = await SalesmanBillService.getByPumpMaster();
          set({ bills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch bills";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchBillsByCustomerId: async (customerId: string, limit?: number) => {
        set({ loading: true, error: null });
        try {
          const customerBills = await SalesmanBillService.getByCustomer(
            customerId,
            limit
          );
          set({ customerBills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch customer bills";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchBillsByDateRange: async (startDate: string, endDate: string) => {
        set({ loading: true, error: null });
        try {
          const bills = await SalesmanBillService.getByDateRange(
            startDate,
            endDate
          );
          set({ bills, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch bills by date range";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getNextBillNo: async () => {
        try {
          const nextBillNo = await SalesmanBillService.getNextBillNo();
          set({ nextBillNo });
          return nextBillNo;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to get next bill number";
          toast.error(errorMessage);
          throw error;
        }
      },

      createBill: async (bill: CreateSalesmanBillRequest) => {
        set({ loading: true, error: null });
        try {
          const newBill = await SalesmanBillService.create(bill);
          get().addBill(newBill);
          set({ loading: false });
          toast.success("Bill created successfully");
          return newBill;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create bill";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateBill: async (id: string, bill: UpdateSalesmanBillRequest) => {
        set({ loading: true, error: null });
        try {
          const updatedBill = await SalesmanBillService.update(id, bill);
          get().updateBillInStore(id, updatedBill);
          set({ loading: false });
          toast.success("Bill updated successfully");
          return updatedBill;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update bill";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeBill: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await SalesmanBillService.delete(id);
          get().deleteBill(id);
          set({ loading: false });
          toast.success("Bill deleted successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete bill";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: "salesman-bill-store",
    }
  )
);
