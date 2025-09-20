import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Tank, CreateTank, UpdateTank } from '@/types';
import { CreateTankSchema, UpdateTankSchema } from '@/types';
import { TankService } from '@/services/api';
import { toast } from 'sonner';

interface TankState {
  tanks: Tank[];
  loading: boolean;
  error: string | null;

  // Actions
  setTanks: (tanks: Tank[]) => void;
  addTank: (tank: Tank) => void;
  updateTank: (id: string, tank: Partial<Tank>) => void;
  deleteTank: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchTanks: () => Promise<void>;
  createTank: (tank: CreateTank) => Promise<void>;
  editTank: (id: string, tank: UpdateTank) => Promise<void>;
  removeTank: (id: string) => Promise<void>;
}

export const useTankStore = create<TankState>()(
  devtools(
    (set) => ({
      tanks: [],
      loading: false,
      error: null,

      setTanks: (tanks) => set({ tanks }),

      addTank: (tank) => {
        set((state) => ({
          tanks: [...state.tanks, tank],
        }));
      },

      updateTank: (id, tankUpdate) => {
        set((state) => ({
          tanks: state.tanks.map((tank) =>
            tank.id === id ? { ...tank, ...tankUpdate } : tank
          ),
        }));
      },

      deleteTank: (id) => {
        set((state) => ({
          tanks: state.tanks.filter((tank) => tank.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API methods using backend
      fetchTanks: async () => {
        set({ loading: true, error: null });
        try {
          const tanks = await TankService.getAll();
          console.log(tanks);
          set({ tanks, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch tanks';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      createTank: async (tank) => {
        set({ loading: true, error: null });
        try {
          // Validate with CreateTankSchema
          const validatedTank = CreateTankSchema.parse(tank);

          const newTank = await TankService.create(validatedTank);

          set((state) => ({
            tanks: [...state.tanks, newTank],
            loading: false,
          }));
          toast.success('Tank created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create tank';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editTank: async (id, tankUpdate) => {
        set({ loading: true, error: null });
        try {
          // Validate the update data with UpdateTankSchema
          const validatedTankUpdate = UpdateTankSchema.parse(tankUpdate);

          const updatedTank = await TankService.update(id, validatedTankUpdate);

          set((state) => ({
            tanks: state.tanks.map((tank) =>
              tank.id === id ? updatedTank : tank
            ),
            loading: false,
          }));
          toast.success('Tank updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update tank';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeTank: async (id) => {
        set({ loading: true, error: null });
        try {
          await TankService.delete(id);

          set((state) => ({
            tanks: state.tanks.filter((tank) => tank.id !== id),
            loading: false,
          }));
          toast.success('Tank deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete tank';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },
    }),
    {
      name: 'tank-store',
    }
  )
);
