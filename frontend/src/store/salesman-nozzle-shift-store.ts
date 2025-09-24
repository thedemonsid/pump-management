import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  SalesmanNozzleShift,
  CreateSalesmanNozzleShift,
  CloseSalesmanNozzleShift,
} from '@/types';
import { SalesmanNozzleShiftService } from '@/services/salesman-nozzle-shift-service';
import { toast } from 'sonner';

interface SalesmanNozzleShiftState {
  shifts: SalesmanNozzleShift[];
  activeShifts: SalesmanNozzleShift[];
  loading: boolean;
  error: string | null;

  // Actions
  setShifts: (shifts: SalesmanNozzleShift[]) => void;
  setActiveShifts: (shifts: SalesmanNozzleShift[]) => void;
  addShift: (shift: SalesmanNozzleShift) => void;
  updateShift: (id: string, shift: Partial<SalesmanNozzleShift>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchShifts: (params?: {
    fromDate?: string;
    toDate?: string;
    salesmanId?: string;
  }) => Promise<void>;
  createShift: (shift: CreateSalesmanNozzleShift) => Promise<void>;
  closeShift: (
    id: string,
    closeData: CloseSalesmanNozzleShift
  ) => Promise<void>;
  fetchActiveShifts: (salesmanId?: string) => Promise<void>;
}

export const useSalesmanNozzleShiftStore = create<SalesmanNozzleShiftState>()(
  devtools(
    (set, get) => ({
      shifts: [],
      activeShifts: [],
      loading: false,
      error: null,

      setShifts: (shifts) => set({ shifts }),

      setActiveShifts: (activeShifts) => set({ activeShifts }),

      addShift: (shift) => {
        set((state) => ({
          shifts: [shift, ...state.shifts],
        }));
      },

      updateShift: (id, updatedShift) =>
        set((state) => ({
          shifts: state.shifts.map((shift) =>
            shift.id === id ? { ...shift, ...updatedShift } : shift
          ),
          activeShifts: state.activeShifts.map((shift) =>
            shift.id === id ? { ...shift, ...updatedShift } : shift
          ),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      fetchShifts: async (params) => {
        try {
          set({ loading: true, error: null });
          const shifts = await SalesmanNozzleShiftService.getAll(params);
          set({ shifts });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch shifts';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      createShift: async (shiftData) => {
        try {
          set({ loading: true, error: null });
          const newShift = await SalesmanNozzleShiftService.create(shiftData);
          get().addShift(newShift);
          set((state) => ({
            activeShifts: [...state.activeShifts, newShift],
          }));
          toast.success('Shift started successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to start shift';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      closeShift: async (id, closeData) => {
        try {
          set({ loading: true, error: null });
          const updatedShift = await SalesmanNozzleShiftService.close(
            id,
            closeData
          );
          get().updateShift(id, updatedShift);
          set((state) => ({
            activeShifts: state.activeShifts.filter((shift) => shift.id !== id),
          }));
          toast.success('Shift closed successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to close shift';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchActiveShifts: async (salesmanId) => {
        if (!salesmanId) {
          set({ activeShifts: [] });
          return;
        }
        try {
          const activeShifts = await SalesmanNozzleShiftService.getActiveShifts(
            salesmanId
          );
          set({ activeShifts });
        } catch (error) {
          console.error('Error fetching active shifts:', error);
          // Silently fail for active shifts fetch
          set({ activeShifts: [] });
        }
      },
    }),
    {
      name: 'salesman-nozzle-shift-store',
    }
  )
);
