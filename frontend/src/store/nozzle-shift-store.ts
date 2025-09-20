import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  NozzleShiftResponse,
  CreateNozzleShiftRequest,
  UpdateNozzleShiftRequest,
} from '@/types';
import { NozzleShiftService } from '@/services';
import { toast } from 'sonner';

interface NozzleShiftState {
  nozzleShifts: NozzleShiftResponse[];
  loading: boolean;
  error: string | null;

  // Actions
  setNozzleShifts: (shifts: NozzleShiftResponse[]) => void;
  addNozzleShift: (shift: NozzleShiftResponse) => void;
  updateNozzleShift: (id: string, shift: Partial<NozzleShiftResponse>) => void;
  deleteNozzleShift: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchNozzleShifts: (page?: number, size?: number) => Promise<void>;
  fetchAllNozzleShifts: () => Promise<void>;
  fetchNozzleShiftById: (id: string) => Promise<NozzleShiftResponse>;
  fetchShiftsByNozzleId: (nozzleId: string) => Promise<void>;
  fetchShiftsBySalesmanId: (salesmanId: string) => Promise<void>;
  fetchShiftsByDate: (date: string) => Promise<void>;
  fetchOpenShifts: () => Promise<void>;
  createNozzleShift: (request: CreateNozzleShiftRequest) => Promise<void>;
  editNozzleShift: (
    id: string,
    request: UpdateNozzleShiftRequest
  ) => Promise<void>;
  removeNozzleShift: (id: string) => Promise<void>;
}

export const useNozzleShiftStore = create<NozzleShiftState>()(
  devtools(
    (set, get) => ({
      nozzleShifts: [],
      loading: false,
      error: null,

      setNozzleShifts: (shifts) => set({ nozzleShifts: shifts }),

      addNozzleShift: (shift) => {
        set((state) => ({
          nozzleShifts: [...state.nozzleShifts, shift],
        }));
      },

      updateNozzleShift: (id, updatedShift) =>
        set((state) => ({
          nozzleShifts: state.nozzleShifts.map((shift) =>
            shift.id === id ? { ...shift, ...updatedShift } : shift
          ),
        })),

      deleteNozzleShift: (id) =>
        set((state) => ({
          nozzleShifts: state.nozzleShifts.filter((shift) => shift.id !== id),
        })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchNozzleShiftById: async (id) => {
        try {
          set({ loading: true, error: null });
          const shift = await NozzleShiftService.getById(id);
          return shift;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch nozzle shift',
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchShiftsByNozzleId: async (nozzleId) => {
        try {
          set({ loading: true, error: null });
          const shifts = await NozzleShiftService.getByNozzleId(nozzleId);
          set({ nozzleShifts: shifts });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch shifts by nozzle',
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchShiftsBySalesmanId: async (salesmanId) => {
        try {
          set({ loading: true, error: null });
          const shifts = await NozzleShiftService.getBySalesmanId(salesmanId);
          set({ nozzleShifts: shifts });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch shifts by salesman',
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchShiftsByDate: async (date) => {
        try {
          set({ loading: true, error: null });
          const shifts = await NozzleShiftService.getByShiftDate(date);
          set({ nozzleShifts: shifts });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch shifts by date',
          });
        } finally {
          set({ loading: false });
        }
      },

      fetchOpenShifts: async () => {
        try {
          set({ loading: true, error: null });
          const shifts = await NozzleShiftService.getOpenShifts();
          set({ nozzleShifts: shifts });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch open shifts',
          });
        } finally {
          set({ loading: false });
        }
      },

      createNozzleShift: async (request) => {
        try {
          set({ loading: true, error: null });
          const newShift = await NozzleShiftService.create(request);
          get().addNozzleShift(newShift);
          toast.success('Nozzle shift created successfully');
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create nozzle shift',
          });
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to create nozzle shift'
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      editNozzleShift: async (id, request) => {
        try {
          set({ loading: true, error: null });
          const updatedShift = await NozzleShiftService.update(id, request);
          get().updateNozzleShift(id, updatedShift);
          toast.success('Nozzle shift updated successfully');
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update nozzle shift',
          });
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to update nozzle shift'
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      removeNozzleShift: async (id) => {
        try {
          set({ loading: true, error: null });
          await NozzleShiftService.delete(id);
          get().deleteNozzleShift(id);
          toast.success('Nozzle shift deleted successfully');
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete nozzle shift',
          });
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to delete nozzle shift'
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'nozzle-shift-store',
    }
  )
);
