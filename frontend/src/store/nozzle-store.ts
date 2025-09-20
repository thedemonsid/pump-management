import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Nozzle, CreateNozzle, UpdateNozzle } from '@/types';
import {
  CreateNozzleSchema,
  UpdateNozzleSchema,
  DEFAULT_PUMP_INFO,
} from '@/types';
import { NozzleService } from '@/services/api';
import { toast } from 'sonner';

interface NozzleState {
  nozzles: Nozzle[];
  loading: boolean;
  error: string | null;

  // Actions
  setNozzles: (nozzles: Nozzle[]) => void;
  addNozzle: (nozzle: CreateNozzle) => void;
  updateNozzle: (id: string, nozzle: Partial<Nozzle>) => void;
  deleteNozzle: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchNozzles: () => Promise<void>;
  fetchNozzleById: (id: string) => Promise<Nozzle>;
  createNozzle: (nozzle: CreateNozzle) => Promise<void>;
  editNozzle: (id: string, nozzle: UpdateNozzle) => Promise<void>;
  removeNozzle: (id: string) => Promise<void>;
}

export const useNozzleStore = create<NozzleState>()(
  devtools(
    (set, get) => ({
      nozzles: [],
      loading: false,
      error: null,

      setNozzles: (nozzles) => set({ nozzles }),

      addNozzle: (nozzle: Nozzle) => {
        set((state) => ({
          nozzles: [...state.nozzles, nozzle],
        }));
      },

      updateNozzle: (id, updatedNozzle) =>
        set((state) => ({
          nozzles: state.nozzles.map((nozzle) =>
            nozzle.id === id ? { ...nozzle, ...updatedNozzle } : nozzle
          ),
        })),

      deleteNozzle: (id) =>
        set((state) => ({
          nozzles: state.nozzles.filter((nozzle) => nozzle.id !== id),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // API methods
      fetchNozzles: async () => {
        const { setLoading, setError, setNozzles } = get();

        setLoading(true);
        setError(null);

        try {
          const nozzles = await NozzleService.getAllForPump();
          setNozzles(nozzles);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch nozzles';
          setError(errorMessage);
          console.error('Error fetching nozzles:', error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      fetchNozzleById: async (id: string) => {
        const { setLoading, setError } = get();

        setLoading(true);
        setError(null);

        try {
          const nozzle = await NozzleService.getById(id);
          return nozzle;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch nozzle';
          setError(errorMessage);
          console.error('Error fetching nozzle:', error);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      createNozzle: async (nozzleData) => {
        const { setLoading, setError, fetchNozzles } = get();

        setLoading(true);
        setError(null);

        try {
          // Add default pump info if missing
          const withDefaults = {
            ...nozzleData,
            pumpMasterId: DEFAULT_PUMP_INFO.id,
          };
          // Validate with Zod
          const validatedNozzle = CreateNozzleSchema.parse(withDefaults);

          await NozzleService.create(validatedNozzle);

          // Refresh the nozzles list to get the latest data with tank associations
          await fetchNozzles();
          toast.success('Nozzle created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create nozzle';
          setError(errorMessage);
          console.error('Error creating nozzle:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      editNozzle: async (id, nozzleData) => {
        const { setLoading, setError, fetchNozzles } = get();

        setLoading(true);
        setError(null);

        try {
          // Validate the update data
          const validatedNozzle = UpdateNozzleSchema.parse(nozzleData);

          // Send only the valid update fields to the backend
          await NozzleService.update(id, validatedNozzle);

          // Refresh the nozzles list to get the latest data with tank associations
          await fetchNozzles();
          toast.success('Nozzle updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update nozzle';
          setError(errorMessage);
          console.error('Error updating nozzle:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      removeNozzle: async (id) => {
        const { setLoading, setError, deleteNozzle } = get();

        setLoading(true);
        setError(null);

        try {
          await NozzleService.delete(id);
          deleteNozzle(id);
          toast.success('Nozzle deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete nozzle';
          setError(errorMessage);
          console.error('Error deleting nozzle:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },
    }),
    { name: 'nozzle-store' }
  )
);
