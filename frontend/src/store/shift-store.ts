import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Shift } from '@/types';
import { ShiftService } from '@/services/api';
import { toast } from 'sonner';

interface ShiftState {
  shifts: Shift[];
  loading: boolean;
  error: string | null;

  // Actions
  setShifts: (shifts: Shift[]) => void;
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, shift: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchShifts: () => Promise<void>;
  createShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  editShift: (id: string, shift: Partial<Shift>) => Promise<void>;
  removeShift: (id: string) => Promise<void>;
}

export const useShiftStore = create<ShiftState>()(
  devtools(
    (set, get) => ({
      shifts: [],
      loading: false,
      error: null,

      setShifts: (shifts) => set({ shifts }),

      addShift: (shift) => {
        const newShift = { ...shift };
        set((state) => ({
          shifts: [...state.shifts, newShift],
        }));
      },

      updateShift: (id, updatedShift) =>
        set((state) => ({
          shifts: state.shifts.map((shift) =>
            shift.id === id ? { ...shift, ...updatedShift } : shift
          ),
        })),

      deleteShift: (id) =>
        set((state) => ({
          shifts: state.shifts.filter((shift) => shift.id !== id),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // API methods
      fetchShifts: async () => {
        const { setLoading, setError, setShifts } = get();

        setLoading(true);
        setError(null);

        try {
          const shifts = await ShiftService.getAll();
          setShifts(shifts);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch shifts';
          setError(errorMessage);
          console.error('Error fetching shifts:', error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      createShift: async (shiftData) => {
        const { setLoading, setError, addShift } = get();

        setLoading(true);
        setError(null);

        try {
          const createdShift = await ShiftService.create(shiftData);
          addShift(createdShift);
          toast.success('Shift created successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create shift';
          setError(errorMessage);
          console.error('Error creating shift:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      editShift: async (id, shiftData) => {
        const { setLoading, setError, updateShift } = get();

        setLoading(true);
        setError(null);

        try {
          const updatedShift = await ShiftService.update(id, shiftData);
          updateShift(id, updatedShift);
          toast.success('Shift updated successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update shift';
          setError(errorMessage);
          console.error('Error updating shift:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      removeShift: async (id) => {
        const { setLoading, setError, deleteShift } = get();

        setLoading(true);
        setError(null);

        try {
          await ShiftService.delete(id);
          deleteShift(id);
          toast.success('Shift deleted successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete shift';
          setError(errorMessage);
          console.error('Error deleting shift:', error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },
    }),
    { name: 'shift-store' }
  )
);
