import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Salesman } from '@/types';
import { SalesmanSchema, DEFAULT_PUMP_INFO } from '@/types';
import { SalesmanService } from '@/services/api';
import { toast } from 'sonner';

interface SalesmanState {
  salesmen: Salesman[];
  loading: boolean;
  error: string | null;

  // Actions
  setSalesmen: (salesmen: Salesman[]) => void;
  addSalesman: (salesman: Salesman) => void;
  updateSalesman: (id: string, salesman: Partial<Salesman>) => void;
  deleteSalesman: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchSalesmen: () => Promise<void>;
  createSalesman: (
    salesman: Omit<Salesman, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  editSalesman: (id: string, salesman: Partial<Salesman>) => Promise<void>;
  removeSalesman: (id: string) => Promise<void>;
}

export const useSalesmanStore = create<SalesmanState>()(
  devtools(
    (set, get) => ({
      salesmen: [],
      loading: false,
      error: null,

      setSalesmen: (salesmen) => set({ salesmen }),

      addSalesman: (salesman) => {
        set((state) => ({
          salesmen: [...state.salesmen, salesman],
        }));
      },

      updateSalesman: (id, updatedSalesman) =>
        set((state) => ({
          salesmen: state.salesmen.map((salesman) =>
            salesman.id === id ? { ...salesman, ...updatedSalesman } : salesman
          ),
        })),

      deleteSalesman: (id) =>
        set((state) => ({
          salesmen: state.salesmen.filter((salesman) => salesman.id !== id),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // API methods
      fetchSalesmen: async () => {
        const { setLoading, setError, setSalesmen } = get();

        setLoading(true);
        setError(null);

        try {
          const salesmen = await SalesmanService.getAll();
          setSalesmen(salesmen);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch salesmen';
          setError(errorMessage);
          console.error('Error fetching salesmen:', error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      createSalesman: async (salesmanData) => {
        const { setLoading, setError, addSalesman } = get();

        setLoading(true);
        setError(null);

        try {
          // Validate the salesman data
          const validatedSalesman = SalesmanSchema.parse({
            ...salesmanData,
            pumpMasterId: DEFAULT_PUMP_INFO.id,
          });

          // Remove id, createdAt, updatedAt from the data to be sent to the server
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, createdAt, updatedAt, ...salesmanToCreate } =
            validatedSalesman;

          // Ensure email is always a string (empty string if undefined)
          const salesmanToCreateWithEmail = {
            ...salesmanToCreate,
            email: salesmanToCreate.email ?? '',
          };

          const createdSalesman = await SalesmanService.create(
            salesmanToCreateWithEmail
          );
          addSalesman(createdSalesman);
          toast.success('Salesman created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to create salesman';
          setError(errorMessage);
          console.error('Error creating salesman:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      editSalesman: async (id, salesmanData) => {
        const { setLoading, setError, updateSalesman } = get();

        setLoading(true);
        setError(null);

        try {
          // Remove id, createdAt, updatedAt from the data
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _, createdAt, updatedAt, ...updateData } = salesmanData;

          const updatedSalesman = await SalesmanService.update(
            id,
            updateData as Omit<Salesman, 'id' | 'createdAt' | 'updatedAt'>
          );
          updateSalesman(id, updatedSalesman);
          toast.success('Salesman updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to update salesman';
          setError(errorMessage);
          console.error('Error updating salesman:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      removeSalesman: async (id) => {
        const { setLoading, setError, deleteSalesman } = get();

        setLoading(true);
        setError(null);

        try {
          await SalesmanService.delete(id);
          deleteSalesman(id);
          toast.success('Salesman deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to delete salesman';
          setError(errorMessage);
          console.error('Error deleting salesman:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },
    }),
    { name: 'salesman-store' }
  )
);
