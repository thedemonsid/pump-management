import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  FuelPurchase,
  CreateFuelPurchase,
  UpdateFuelPurchase,
} from "@/types";
import { FuelPurchaseService } from "@/services/api";
import { toast } from "sonner";

interface FuelPurchaseState {
  fuelPurchases: FuelPurchase[];
  loading: boolean;
  error: string | null;

  setFuelPurchases: (fuelPurchases: FuelPurchase[]) => void;
  addFuelPurchase: (fuelPurchase: FuelPurchase) => void;
  updateFuelPurchase: (id: string, fuelPurchase: Partial<FuelPurchase>) => void;
  deleteFuelPurchase: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchFuelPurchases: (fromDate?: Date, toDate?: Date) => Promise<void>;
  fetchFuelPurchasesByPumpMasterId: (
    pumpMasterId: string,
    limit?: number
  ) => Promise<void>;
  fetchFuelPurchasesBySupplierId: (
    supplierId: string,
    limit?: number
  ) => Promise<void>;
  createFuelPurchase: (fuelPurchase: CreateFuelPurchase) => Promise<void>;
  editFuelPurchase: (
    id: string,
    fuelPurchase: UpdateFuelPurchase
  ) => Promise<void>;
  removeFuelPurchase: (id: string) => Promise<void>;
  getFuelPurchaseById: (id: string) => Promise<FuelPurchase>;
}

export const useFuelPurchaseStore = create<FuelPurchaseState>()(
  devtools(
    (set) => ({
      fuelPurchases: [],
      loading: false,
      error: null,

      setFuelPurchases: (fuelPurchases) => set({ fuelPurchases }),

      addFuelPurchase: (fuelPurchase) => {
        set((state) => ({
          fuelPurchases: [...state.fuelPurchases, fuelPurchase],
        }));
      },

      updateFuelPurchase: (id, fuelPurchaseUpdate) => {
        set((state) => ({
          fuelPurchases: state.fuelPurchases.map((fuelPurchase) =>
            fuelPurchase.id === id
              ? { ...fuelPurchase, ...fuelPurchaseUpdate }
              : fuelPurchase
          ),
        }));
      },

      deleteFuelPurchase: (id) => {
        set((state) => ({
          fuelPurchases: state.fuelPurchases.filter(
            (fuelPurchase) => fuelPurchase.id !== id
          ),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchFuelPurchases: async (fromDate?: Date, toDate?: Date) => {
        set({ loading: true, error: null });
        try {
          const fuelPurchases = await FuelPurchaseService.getAll(
            fromDate,
            toDate
          );
          set({ fuelPurchases, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch fuel purchases";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      fetchFuelPurchasesByPumpMasterId: async () => {
        // pumpMasterId is now handled by the backend automatically from security context
        set({ loading: true, error: null });
        try {
          const fuelPurchases = await FuelPurchaseService.getAll();
          set({ fuelPurchases, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch fuel purchases by pump master";
          set({ error: errorMessage, loading: false });
        }
      },

      fetchFuelPurchasesBySupplierId: async (
        supplierId: string,
        limit?: number
      ) => {
        set({ loading: true, error: null });
        try {
          const fuelPurchases = await FuelPurchaseService.getBySupplierId(
            supplierId,
            limit
          );
          set({ fuelPurchases, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch fuel purchases by supplier";
          set({ error: errorMessage, loading: false });
        }
      },

      createFuelPurchase: async (fuelPurchase) => {
        set({ loading: true, error: null });
        try {
          const newFuelPurchase = await FuelPurchaseService.create(
            fuelPurchase
          );
          set((state) => ({
            fuelPurchases: [...state.fuelPurchases, newFuelPurchase],
            loading: false,
          }));
          toast.success("Fuel purchase created successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create fuel purchase";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editFuelPurchase: async (id, fuelPurchaseUpdate) => {
        set({ loading: true, error: null });
        try {
          const updatedFuelPurchase = await FuelPurchaseService.update(
            id,
            fuelPurchaseUpdate
          );
          set((state) => ({
            fuelPurchases: state.fuelPurchases.map((fuelPurchase) =>
              fuelPurchase.id === id ? updatedFuelPurchase : fuelPurchase
            ),
            loading: false,
          }));
          toast.success("Fuel purchase updated successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update fuel purchase";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removeFuelPurchase: async (id) => {
        set({ loading: true, error: null });
        try {
          await FuelPurchaseService.delete(id);
          set((state) => ({
            fuelPurchases: state.fuelPurchases.filter(
              (fuelPurchase) => fuelPurchase.id !== id
            ),
            loading: false,
          }));
          toast.success("Fuel purchase deleted successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete fuel purchase";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getFuelPurchaseById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const fuelPurchase = await FuelPurchaseService.getById(id);
          set({ loading: false });
          return fuelPurchase;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch fuel purchase";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
    }),
    {
      name: "fuel-purchase-store",
    }
  )
);
