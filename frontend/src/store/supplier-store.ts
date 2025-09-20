import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Supplier } from '@/types';
import { SupplierService } from '@/services/api';
import { toast } from 'sonner';

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;

  // Actions
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchSuppliers: () => Promise<void>;
  createSupplier: (
    supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ) => Promise<void>;
  editSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;
}

export const useSupplierStore = create<SupplierState>()(
  devtools(
    (set) => ({
      suppliers: [],
      loading: false,
      error: null,

      setSuppliers: (suppliers) => set({ suppliers }),

      addSupplier: (supplier) => {
        set((state) => ({
          suppliers: [...state.suppliers, supplier],
        }));
      },

      updateSupplier: (id, supplierUpdate) => {
        set((state) => ({
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === id ? { ...supplier, ...supplierUpdate } : supplier
          ),
        }));
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API methods using backend
      fetchSuppliers: async () => {
        set({ loading: true, error: null });
        try {
          const suppliers = await SupplierService.getAll();
          console.log('Suppliers : ', suppliers);
          set({ suppliers, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch suppliers';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      createSupplier: async (supplier) => {
        set({ loading: true, error: null });
        try {
          const newSupplier = await SupplierService.create(supplier);

          set((state) => ({
            suppliers: [...state.suppliers, newSupplier],
            loading: false,
          }));
          toast.success('Supplier created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to create supplier';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editSupplier: async (id, supplierUpdate) => {
        set({ loading: true, error: null });
        try {
          const updatedSupplier = await SupplierService.update(
            id,
            supplierUpdate
          );

          set((state) => ({
            suppliers: state.suppliers.map((supplier) =>
              supplier.id === id ? updatedSupplier : supplier
            ),
            loading: false,
          }));
          toast.success('Supplier updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to update supplier';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeSupplier: async (id) => {
        set({ loading: true, error: null });
        try {
          await SupplierService.delete(id);

          set((state) => ({
            suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
            loading: false,
          }));
          toast.success('Supplier deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete supplier';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'supplier-store',
    }
  )
);
