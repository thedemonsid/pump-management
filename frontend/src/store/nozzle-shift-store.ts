import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  NozzleShiftResponse,
  CreateNozzleShiftRequest,
  UpdateNozzleShiftRequest,
} from '@/types';
import { NozzleShiftService } from '@/services/nozzle-shift-service';
import { toast } from 'sonner';

interface NozzleShiftState {
  shifts: NozzleShiftResponse[];
  loading: boolean;
  error: string | null;

  // Actions
  setShifts: (shifts: NozzleShiftResponse[]) => void;
  addShift: (shift: NozzleShiftResponse) => void;
  updateShift: (id: string, shift: Partial<NozzleShiftResponse>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchShifts: (params?: {
    fromDate?: string;
    toDate?: string;
    nozzleId?: string;
    salesmanId?: string;
  }) => Promise<void>;
  createNozzleShift: (shift: CreateNozzleShiftRequest) => Promise<void>;
  editNozzleShift: (
    id: string,
    shift: UpdateNozzleShiftRequest
  ) => Promise<void>;
  getShiftById: (id: string) => Promise<NozzleShiftResponse | undefined>;
}

export const useNozzleShiftStore = create<NozzleShiftState>()(
  devtools(
    (set, get) => ({
      shifts: [],
      loading: false,
      error: null,

      setShifts: (shifts) => set({ shifts }),

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
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      fetchShifts: async (params) => {
        try {
          set({ loading: true, error: null });
          const shifts = await NozzleShiftService.getAll(params);
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

      createNozzleShift: async (shiftData) => {
        try {
          set({ loading: true, error: null });
          const newShift = await NozzleShiftService.create(shiftData);
          get().addShift(newShift);
          toast.success('Shift created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create shift';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      editNozzleShift: async (id, shiftData) => {
        try {
          set({ loading: true, error: null });
          const updatedShift = await NozzleShiftService.update(id, shiftData);
          get().updateShift(id, updatedShift);
          toast.success('Shift updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update shift';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      getShiftById: async (id) => {
        try {
          return await NozzleShiftService.getById(id);
        } catch (error) {
          console.error('Error fetching shift:', error);
          return undefined;
        }
      },
    }),
    {
      name: 'nozzle-shift-store',
    }
  )
);
