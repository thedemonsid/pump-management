import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  ShiftResponse,
  ShiftDetailsResponse,
  StartShiftRequest,
  CloseShiftRequest,
  NozzleAssignmentResponse,
  AddNozzleRequest,
  CloseNozzleRequest,
  CreateShiftAccountingRequest,
  ShiftAccountingResponse,
} from "@/types";
import { SalesmanShiftService, NozzleAssignmentService } from "@/services";
import { toast } from "sonner";

interface SalesmanShiftState {
  // State
  shifts: ShiftResponse[];
  activeShifts: ShiftResponse[];
  currentShift: ShiftDetailsResponse | null;
  nozzleAssignments: NozzleAssignmentResponse[];
  loading: boolean;
  error: string | null;

  // Basic actions
  setShifts: (shifts: ShiftResponse[]) => void;
  setActiveShifts: (shifts: ShiftResponse[]) => void;
  setCurrentShift: (shift: ShiftDetailsResponse | null) => void;
  setNozzleAssignments: (assignments: NozzleAssignmentResponse[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Shift API methods
  fetchShifts: (params?: {
    fromDate?: string;
    toDate?: string;
    salesmanId?: string;
  }) => Promise<void>;
  fetchShiftById: (id: string) => Promise<ShiftDetailsResponse>;
  fetchActiveShifts: (salesmanId?: string) => Promise<void>;
  startShift: (request: StartShiftRequest) => Promise<ShiftResponse>;
  closeShift: (
    id: string,
    payload?: CloseShiftRequest
  ) => Promise<ShiftResponse>;

  // Nozzle assignment methods
  fetchNozzleAssignments: (shiftId: string) => Promise<void>;
  addNozzleToShift: (
    shiftId: string,
    request: AddNozzleRequest
  ) => Promise<NozzleAssignmentResponse>;
  closeNozzleAssignment: (
    shiftId: string,
    assignmentId: string,
    request: CloseNozzleRequest
  ) => Promise<NozzleAssignmentResponse>;

  // Accounting methods
  createAccounting: (
    shiftId: string,
    data: CreateShiftAccountingRequest
  ) => Promise<ShiftAccountingResponse>;
  fetchAccounting: (shiftId: string) => Promise<ShiftAccountingResponse>;
  updateAccounting: (
    shiftId: string,
    data: CreateShiftAccountingRequest
  ) => Promise<ShiftAccountingResponse>;

  // Helper methods
  clearCurrentShift: () => void;
  clearError: () => void;
}

const initialState = {
  shifts: [],
  activeShifts: [],
  currentShift: null,
  nozzleAssignments: [],
  loading: false,
  error: null,
};

export const useSalesmanShiftStore = create<SalesmanShiftState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Basic actions
      setShifts: (shifts) => set({ shifts }),
      setActiveShifts: (activeShifts) => set({ activeShifts }),
      setCurrentShift: (currentShift) => set({ currentShift }),
      setNozzleAssignments: (nozzleAssignments) => set({ nozzleAssignments }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Fetch all shifts with optional filters
      fetchShifts: async (params) => {
        set({ loading: true, error: null });
        try {
          const shifts = await SalesmanShiftService.getAll(params);
          set({ shifts, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch shifts";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Fetch shift by ID with details
      fetchShiftById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const shift = await SalesmanShiftService.getById(id);
          set({ currentShift: shift, loading: false });
          return shift;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch shift";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Fetch active (open) shifts
      fetchActiveShifts: async (salesmanId?: string) => {
        set({ loading: true, error: null });
        try {
          const activeShifts = await SalesmanShiftService.getActiveShifts(
            salesmanId
          );
          set({ activeShifts, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch active shifts";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Start a new shift
      startShift: async (request: StartShiftRequest) => {
        set({ loading: true, error: null });
        try {
          const newShift = await SalesmanShiftService.startShift(request);
          set((state) => ({
            shifts: [newShift, ...state.shifts],
            activeShifts: [newShift, ...state.activeShifts],
            loading: false,
          }));
          toast.success("Shift started successfully");
          return newShift;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to start shift";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Close a shift
      closeShift: async (id: string, payload?: CloseShiftRequest) => {
        set({ loading: true, error: null });
        try {
          const closedShift = await SalesmanShiftService.closeShift(
            id,
            payload
          );
          set((state) => ({
            shifts: state.shifts.map((shift) =>
              shift.id === id ? closedShift : shift
            ),
            activeShifts: state.activeShifts.filter((shift) => shift.id !== id),
            currentShift:
              state.currentShift?.id === id
                ? { ...state.currentShift, ...closedShift }
                : state.currentShift,
            loading: false,
          }));
          toast.success("Shift closed successfully");
          return closedShift;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to close shift";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Fetch nozzle assignments for a shift
      fetchNozzleAssignments: async (shiftId: string) => {
        set({ loading: true, error: null });
        try {
          const assignments =
            await NozzleAssignmentService.getAssignmentsForShift(shiftId);
          set({ nozzleAssignments: assignments, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch nozzle assignments";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Add nozzle to shift
      addNozzleToShift: async (shiftId: string, request: AddNozzleRequest) => {
        set({ loading: true, error: null });
        try {
          const assignment = await NozzleAssignmentService.addNozzleToShift(
            shiftId,
            request
          );
          set((state) => ({
            nozzleAssignments: [...state.nozzleAssignments, assignment],
            loading: false,
          }));
          toast.success("Nozzle added to shift successfully");
          return assignment;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to add nozzle to shift";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Close nozzle assignment
      closeNozzleAssignment: async (
        shiftId: string,
        assignmentId: string,
        request: CloseNozzleRequest
      ) => {
        set({ loading: true, error: null });
        try {
          const closedAssignment =
            await NozzleAssignmentService.closeNozzleAssignment(
              shiftId,
              assignmentId,
              request
            );
          set((state) => ({
            nozzleAssignments: state.nozzleAssignments.map((assignment) =>
              assignment.id === assignmentId ? closedAssignment : assignment
            ),
            loading: false,
          }));
          toast.success("Nozzle assignment closed successfully");
          return closedAssignment;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to close nozzle assignment";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Create accounting for shift
      createAccounting: async (
        shiftId: string,
        data: CreateShiftAccountingRequest
      ) => {
        set({ loading: true, error: null });
        try {
          const accounting = await SalesmanShiftService.createAccounting(
            shiftId,
            data
          );
          set({ loading: false });
          toast.success("Accounting created successfully");
          return accounting;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create accounting";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Fetch accounting for shift
      fetchAccounting: async (shiftId: string) => {
        set({ loading: true, error: null });
        try {
          const accounting = await SalesmanShiftService.getAccounting(shiftId);
          set({ loading: false });
          return accounting;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch accounting";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Update accounting for shift
      updateAccounting: async (
        shiftId: string,
        data: CreateShiftAccountingRequest
      ) => {
        set({ loading: true, error: null });
        try {
          const accounting = await SalesmanShiftService.updateAccounting(
            shiftId,
            data
          );
          set({ loading: false });
          toast.success("Accounting updated successfully");
          return accounting;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update accounting";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Helper methods
      clearCurrentShift: () => set({ currentShift: null }),
      clearError: () => set({ error: null }),
    }),
    { name: "SalesmanShiftStore" }
  )
);
