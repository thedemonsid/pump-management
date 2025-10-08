import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Customer, CreateCustomer } from '@/types';
import { CustomerService } from '@/services/api';
import { toast } from 'sonner';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;

  // Actions
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchCustomers: () => Promise<void>;
  createCustomer: (customer: CreateCustomer) => Promise<void>;
  editCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>()(
  devtools(
    (set) => ({
      customers: [],
      loading: false,
      error: null,

      setCustomers: (customers) => set({ customers }),

      addCustomer: (customer) => {
        set((state) => ({
          customers: [...state.customers, customer],
        }));
      },

      updateCustomer: (id, customerUpdate) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id ? { ...customer, ...customerUpdate } : customer
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API methods using backend
      fetchCustomers: async () => {
        set({ loading: true, error: null });
        try {
          const customers = await CustomerService.getAll();
          console.log('Customers : ', customers);
          set({ customers, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch customers';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },
      createCustomer: async (customer) => {
        set({ loading: true, error: null });
        try {
          const customerToSend = {
            ...customer,
            gstNumber: customer.gstNumber === '' ? null : customer.gstNumber,
            panNumber: customer.panNumber === '' ? null : customer.panNumber,
          };
          const newCustomer = await CustomerService.create(customerToSend);

          set((state) => ({
            customers: [...state.customers, newCustomer],
            loading: false,
          }));
          toast.success('Customer created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to create customer';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editCustomer: async (id, customerUpdate) => {
        set({ loading: true, error: null });
        try {
          const updateData = { ...customerUpdate };
          if (updateData.gstNumber === '') updateData.gstNumber = null;
          if (updateData.panNumber === '') updateData.panNumber = null;
          const updatedCustomer = await CustomerService.update(id, updateData);

          set((state) => ({
            customers: state.customers.map((customer) =>
              customer.id === id ? updatedCustomer : customer
            ),
            loading: false,
          }));
          toast.success('Customer updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to update customer';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeCustomer: async (id) => {
        set({ loading: true, error: null });
        try {
          await CustomerService.delete(id);

          set((state) => ({
            customers: state.customers.filter((customer) => customer.id !== id),
            loading: false,
          }));
          toast.success('Customer deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete customer';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'customer-store',
    }
  )
);
