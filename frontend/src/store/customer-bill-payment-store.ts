import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  CustomerBillPaymentResponse,
  CreateCustomerBillPaymentRequest,
  UpdateCustomerBillPaymentRequest,
} from '@/types';
import { CustomerBillPaymentService } from '@/services';
import { toast } from 'sonner';

interface CustomerBillPaymentState {
  payments: CustomerBillPaymentResponse[];
  loading: boolean;
  error: string | null;

  // Actions
  setPayments: (payments: CustomerBillPaymentResponse[]) => void;
  addPayment: (payment: CustomerBillPaymentResponse) => void;
  updatePayment: (
    id: string,
    payment: Partial<CustomerBillPaymentResponse>
  ) => void;
  deletePayment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchPayments: () => Promise<void>;
  fetchPaymentById: (id: string) => Promise<CustomerBillPaymentResponse>;
  fetchPaymentsByPumpMasterId: (pumpMasterId: string) => Promise<void>;
  fetchPaymentsByCustomerId: (
    customerId: string,
    pumpMasterId?: string
  ) => Promise<void>;
  fetchPaymentsByBillId: (billId: string) => Promise<void>;
  createPayment: (payment: CreateCustomerBillPaymentRequest) => Promise<void>;
  editPayment: (
    id: string,
    payment: UpdateCustomerBillPaymentRequest
  ) => Promise<void>;
  removePayment: (id: string) => Promise<void>;
}

export const useCustomerBillPaymentStore = create<CustomerBillPaymentState>()(
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
            payment.id === id ? { ...payment, ...paymentUpdate } : payment
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
          const payments = await CustomerBillPaymentService.getAll();
          console.log(payments);
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch payments';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      fetchPaymentById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const payment = await CustomerBillPaymentService.getById(id);
          set({ loading: false });
          return payment;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch payment';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      fetchPaymentsByPumpMasterId: async (pumpMasterId: string) => {
        set({ loading: true, error: null });
        try {
          const payments = await CustomerBillPaymentService.getByPumpMasterId(
            pumpMasterId
          );
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch payments by pump master';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPaymentsByCustomerId: async (customerId: string) => {
        set({ loading: true, error: null });
        try {
          const customerPayments =
            await CustomerBillPaymentService.getByCustomerId(customerId);
          set({ payments: customerPayments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch payments by customer';
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPaymentsByBillId: async (billId: string) => {
        set({ loading: true, error: null });
        try {
          const payments = await CustomerBillPaymentService.getByBillId(billId);
          set({ payments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch payments by bill';
          set({ error: errorMessage, loading: false });
        }
      },

      createPayment: async (payment) => {
        set({ loading: true, error: null });
        try {
          const newPayment = await CustomerBillPaymentService.create(payment);

          set((state) => ({
            payments: [...state.payments, newPayment],
            loading: false,
          }));
          toast.success('Payment created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create payment';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editPayment: async (id, paymentUpdate) => {
        set({ loading: true, error: null });
        try {
          const updatedPayment = await CustomerBillPaymentService.update(
            id,
            paymentUpdate
          );

          set((state) => ({
            payments: state.payments.map((payment) =>
              payment.id === id ? updatedPayment : payment
            ),
            loading: false,
          }));
          toast.success('Payment updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update payment';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removePayment: async (id) => {
        set({ loading: true, error: null });
        try {
          await CustomerBillPaymentService.delete(id);

          set((state) => ({
            payments: state.payments.filter((payment) => payment.id !== id),
            loading: false,
          }));
          toast.success('Payment deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete payment';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'customer-bill-payment-store',
    }
  )
);
