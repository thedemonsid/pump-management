import { create } from "zustand";
import { SalesmanShiftService } from "@/services/salesman-shift-service";
import type { ShiftResponse, ShiftDetailsResponse } from "@/types";

interface ShiftStore {
  // State
  shifts: ShiftResponse[];
  currentShift: ShiftDetailsResponse | null;
  activeShift: ShiftResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchShifts: (params?: {
    fromDate?: string;
    toDate?: string;
    salesmanId?: string;
  }) => Promise<void>;
  fetchShiftById: (id: string) => Promise<void>;
  fetchActiveShift: (salesmanId?: string) => Promise<void>;
  startShift: (
    salesmanId: string,
    openingCash: number
  ) => Promise<ShiftResponse>;
  closeShift: (id: string) => Promise<void>;
  refreshCurrentShift: () => Promise<void>;
  clearCurrentShift: () => void;
  setError: (error: string | null) => void;
}

export const useShiftStore = create<ShiftStore>((set, get) => ({
  // Initial state
  shifts: [],
  currentShift: null,
  activeShift: null,
  isLoading: false,
  error: null,

  // Fetch all shifts with filters
  fetchShifts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const shifts = await SalesmanShiftService.getAll(params);
      set({ shifts, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to fetch shifts",
        isLoading: false,
      });
    }
  },

  // Fetch single shift details
  fetchShiftById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const shift = await SalesmanShiftService.getById(id);
      set({ currentShift: shift, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to fetch shift details",
        isLoading: false,
      });
    }
  },

  // Fetch active shift for salesman
  fetchActiveShift: async (salesmanId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const shifts = await SalesmanShiftService.getActiveShifts(salesmanId);
      const activeShift = shifts.length > 0 ? shifts[0] : null;
      set({ activeShift, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to fetch active shift",
        isLoading: false,
      });
    }
  },

  // Start a new shift
  startShift: async (salesmanId: string, openingCash: number) => {
    set({ isLoading: true, error: null });
    try {
      const shift = await SalesmanShiftService.startShift({
        salesmanId,
        openingCash,
      });
      set({ activeShift: shift, isLoading: false });
      return shift;
    } catch (error: unknown) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to start shift";
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  // Close shift
  closeShift: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await SalesmanShiftService.closeShift(id);
      set({ activeShift: null, isLoading: false });
      // Refresh current shift if it's the one being closed
      if (get().currentShift?.id === id) {
        await get().fetchShiftById(id);
      }
    } catch (error: unknown) {
      set({
        error:
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to close shift",
        isLoading: false,
      });
      throw error;
    }
  },

  // Refresh current shift details
  refreshCurrentShift: async () => {
    const currentShift = get().currentShift;
    if (currentShift) {
      await get().fetchShiftById(currentShift.id);
    }
  },

  // Clear current shift
  clearCurrentShift: () => {
    set({ currentShift: null });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));
