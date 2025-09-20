import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  SupplierPaymentResponse,
  CreateSupplierPaymentRequest,
  UpdateSupplierPaymentRequest,
} from "@/types";
import { SupplierPaymentService } from "@/services";
import { toast } from "sonner";

interface SupplierPaymentState {
  payments: SupplierPaymentResponse[];
  loading: boolean;
  error: string | null;

  // Actions
  setPayments: (payments: SupplierPaymentResponse[]) => void;
  addPayment: (payment: SupplierPaymentResponse) => void;
  updatePayment: (
    id: string,
    payment: Partial<SupplierPaymentResponse>,
  ) => void;
  deletePayment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchPayments: () => Promise<void>;
  fetchPaymentById: (id: string) => Promise<SupplierPaymentResponse>;
  fetchPaymentsByPumpMasterId: (pumpMasterId: string) => Promise<void>;
  fetchPaymentsBySupplierId: (
    supplierId: string,
    pumpMasterId?: string,
  ) => Promise<void>;
  fetchPaymentsByPurchaseId: (purchaseId: string) => Promise<void>;
  fetchPaymentsByFuelPurchaseId: (fuelPurchaseId: string) => Promise<void>;
  fetchGeneralPaymentsByPumpMasterId: (pumpMasterId: string) => Promise<void>;
  createPayment: (payment: CreateSupplierPaymentRequest) => Promise<void>;
  editPayment: (
    id: string,
    payment: UpdateSupplierPaymentRequest,
  ) => Promise<void>;
  removePayment: (id: string) => Promise<void>;
}

export const useSupplierPaymentStore = create<SupplierPaymentState>()(
  devtools(
    (set) => ({
      payments: [],
      loading: false,
      error: null,

      setPayments: (payments) => set({ payments }),

      addPayment: (payment) => {
        set((state) => ({
          payments: [...state.payments, payment],
        }));
      },

      updatePayment: (id, paymentUpdate) => {
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id ? { ...payment, ...paymentUpdate } : payment,
          ),
        }));
      },

      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API methods using backend
      fetchPayments: async () => {
        set({ loading: true, error: null });
        try {
          const payments = await SupplierPaymentService.getAll();
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch payments";
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPaymentById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const payment = await SupplierPaymentService.getById(id);
          set({ loading: false });
          return payment;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch payment";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      fetchPaymentsByPumpMasterId: async (pumpMasterId: string) => {
        set({ loading: true, error: null });
        try {
          const payments =
            await SupplierPaymentService.getByPumpMasterId(pumpMasterId);
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch payments by pump master";
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPaymentsBySupplierId: async (
        supplierId: string,
        pumpMasterId?: string,
      ) => {
        if (!pumpMasterId) {
          // Fallback to getting all payments if no pump master ID provided
          set({ loading: true, error: null });
          try {
            const payments = await SupplierPaymentService.getAll();
            const supplierPayments = payments.filter(
              (payment: SupplierPaymentResponse) =>
                payment.supplierId === supplierId,
            );
            set({ payments: supplierPayments, loading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch payments by supplier";
            set({ error: errorMessage, loading: false });
          }
          return;
        }

        set({ loading: true, error: null });
        try {
          // Get all payments for the pump master, then filter by supplier
          const allPayments =
            await SupplierPaymentService.getByPumpMasterId(pumpMasterId);
          const supplierPayments = allPayments.filter(
            (payment: SupplierPaymentResponse) =>
              payment.supplierId === supplierId,
          );
          set({ payments: supplierPayments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch payments by supplier";
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPaymentsByPurchaseId: async (purchaseId: string) => {
        set({ loading: true, error: null });
        try {
          const payments =
            await SupplierPaymentService.getByPurchaseId(purchaseId);
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch payments by purchase";
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPaymentsByFuelPurchaseId: async (fuelPurchaseId: string) => {
        set({ loading: true, error: null });
        try {
          const payments =
            await SupplierPaymentService.getByFuelPurchaseId(fuelPurchaseId);
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch payments by fuel purchase";
          set({ error: errorMessage, loading: false });
        }
      },

      fetchGeneralPaymentsByPumpMasterId: async (pumpMasterId: string) => {
        set({ loading: true, error: null });
        try {
          const payments =
            await SupplierPaymentService.getGeneralPaymentsByPumpMasterId(
              pumpMasterId,
            );
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch general payments by pump master";
          set({ error: errorMessage, loading: false });
        }
      },

      createPayment: async (payment) => {
        set({ loading: true, error: null });
        try {
          const newPayment = await SupplierPaymentService.create(payment);

          set((state) => ({
            payments: [...state.payments, newPayment],
            loading: false,
          }));
          toast.success("Supplier payment created successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create payment";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editPayment: async (id, paymentUpdate) => {
        set({ loading: true, error: null });
        try {
          const updatedPayment = await SupplierPaymentService.update(
            id,
            paymentUpdate,
          );

          set((state) => ({
            payments: state.payments.map((payment) =>
              payment.id === id ? updatedPayment : payment,
            ),
            loading: false,
          }));
          toast.success("Supplier payment updated successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update payment";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removePayment: async (id) => {
        set({ loading: true, error: null });
        try {
          await SupplierPaymentService.delete(id);

          set((state) => ({
            payments: state.payments.filter((payment) => payment.id !== id),
            loading: false,
          }));
          toast.success("Supplier payment deleted successfully");
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
      name: "supplier-payment-store",
    },
  ),
);
