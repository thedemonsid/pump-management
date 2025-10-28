import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  SalesmanBillPaymentResponse,
  CreateSalesmanBillPaymentRequest,
  UpdateSalesmanBillPaymentRequest,
} from "@/types";
import { SalesmanBillPaymentService } from "@/services";
import { toast } from "sonner";

interface SalesmanBillPaymentState {
  payments: SalesmanBillPaymentResponse[];
  shiftPayments: SalesmanBillPaymentResponse[];
  customerPayments: SalesmanBillPaymentResponse[];
  loading: boolean;
  error: string | null;

  // Actions
  setPayments: (payments: SalesmanBillPaymentResponse[]) => void;
  setShiftPayments: (payments: SalesmanBillPaymentResponse[]) => void;
  setCustomerPayments: (payments: SalesmanBillPaymentResponse[]) => void;
  addPayment: (payment: SalesmanBillPaymentResponse) => void;
  updatePaymentInStore: (
    id: string,
    payment: Partial<SalesmanBillPaymentResponse>
  ) => void;
  deletePayment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchPayments: () => Promise<void>;
  fetchPaymentById: (id: string) => Promise<SalesmanBillPaymentResponse>;
  fetchPaymentsByShiftId: (salesmanShiftId: string) => Promise<void>;
  fetchPaymentsByCustomerId: (
    customerId: string,
    pumpMasterId?: string
  ) => Promise<void>;
  getTotalByShiftId: (salesmanShiftId: string) => Promise<number>;
  createPayment: (
    payment: CreateSalesmanBillPaymentRequest
  ) => Promise<SalesmanBillPaymentResponse>;
  updatePayment: (
    id: string,
    payment: UpdateSalesmanBillPaymentRequest
  ) => Promise<SalesmanBillPaymentResponse>;
  removePayment: (id: string) => Promise<void>;
}

const initialState: Omit<
  SalesmanBillPaymentState,
  keyof SalesmanBillPaymentState
> = {
  payments: [],
  shiftPayments: [],
  customerPayments: [],
  loading: false,
  error: null,
};

export const useSalesmanBillPaymentStore = create<SalesmanBillPaymentState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setPayments: (payments) => set({ payments }),
      setShiftPayments: (shiftPayments) => set({ shiftPayments }),
      setCustomerPayments: (customerPayments) => set({ customerPayments }),
      addPayment: (payment) =>
        set((state) => ({
          payments: [...state.payments, payment],
          shiftPayments:
            payment.salesmanShiftId === state.shiftPayments[0]?.salesmanShiftId
              ? [...state.shiftPayments, payment]
              : state.shiftPayments,
          customerPayments:
            payment.customerId === state.customerPayments[0]?.customerId
              ? [...state.customerPayments, payment]
              : state.customerPayments,
        })),
      updatePaymentInStore: (id, updatedPayment) =>
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id ? { ...payment, ...updatedPayment } : payment
          ),
          shiftPayments: state.shiftPayments.map((payment) =>
            payment.id === id ? { ...payment, ...updatedPayment } : payment
          ),
          customerPayments: state.customerPayments.map((payment) =>
            payment.id === id ? { ...payment, ...updatedPayment } : payment
          ),
        })),
      deletePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
          shiftPayments: state.shiftPayments.filter(
            (payment) => payment.id !== id
          ),
          customerPayments: state.customerPayments.filter(
            (payment) => payment.id !== id
          ),
        })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchPayments: async () => {
        set({ loading: true, error: null });
        try {
          const payments = await SalesmanBillPaymentService.getAll();
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch payments";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchPaymentById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const payment = await SalesmanBillPaymentService.getById(id);
          set({ loading: false });
          return payment;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch payment";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchPaymentsByShiftId: async (salesmanShiftId: string) => {
        set({ loading: true, error: null });
        try {
          const shiftPayments = await SalesmanBillPaymentService.getByShiftId(
            salesmanShiftId
          );
          set({ shiftPayments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch shift payments";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchPaymentsByCustomerId: async (
        customerId: string,
        pumpMasterId?: string
      ) => {
        set({ loading: true, error: null });
        try {
          const customerPayments =
            await SalesmanBillPaymentService.getByCustomerId(
              customerId,
              pumpMasterId
            );
          set({ customerPayments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch customer payments";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getTotalByShiftId: async (salesmanShiftId: string) => {
        try {
          const total = await SalesmanBillPaymentService.getTotalByShiftId(
            salesmanShiftId
          );
          return total;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to get shift payment total";
          toast.error(errorMessage);
          throw error;
        }
      },

      createPayment: async (payment: CreateSalesmanBillPaymentRequest) => {
        set({ loading: true, error: null });
        try {
          const newPayment = await SalesmanBillPaymentService.create(payment);
          get().addPayment(newPayment);
          set({ loading: false });
          toast.success("Payment created successfully");
          return newPayment;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create payment";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updatePayment: async (
        id: string,
        payment: UpdateSalesmanBillPaymentRequest
      ) => {
        set({ loading: true, error: null });
        try {
          const updatedPayment = await SalesmanBillPaymentService.update(
            id,
            payment
          );
          get().updatePaymentInStore(id, updatedPayment);
          set({ loading: false });
          toast.success("Payment updated successfully");
          return updatedPayment;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update payment";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removePayment: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await SalesmanBillPaymentService.delete(id);
          get().deletePayment(id);
          set({ loading: false });
          toast.success("Payment deleted successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete payment";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: "salesman-bill-payment-store",
    }
  )
);
