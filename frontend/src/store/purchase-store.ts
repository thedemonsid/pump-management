import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Purchase, CreatePurchase, UpdatePurchase } from "@/types";
import { PurchaseService } from "@/services/api";
import { toast } from "sonner";

interface PurchaseState {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;

  // Actions
  setPurchases: (purchases: Purchase[]) => void;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchPurchases: (fromDate?: Date, toDate?: Date) => Promise<void>;
  fetchPurchasesByPumpMasterId: (
    pumpMasterId: string,
    limit?: number
  ) => Promise<void>;
  fetchPurchasesBySupplierId: (
    supplierId: string,
    limit?: number
  ) => Promise<void>;
  createPurchase: (purchase: CreatePurchase) => Promise<void>;
  editPurchase: (id: string, purchase: UpdatePurchase) => Promise<void>;
  removePurchase: (id: string) => Promise<void>;
  getPurchaseById: (id: string) => Promise<Purchase>;
}

export const usePurchaseStore = create<PurchaseState>()(
  devtools(
    (set) => ({
      purchases: [],
      loading: false,
      error: null,

      setPurchases: (purchases) => set({ purchases }),

      addPurchase: (purchase) => {
        set((state) => ({
          purchases: [...state.purchases, purchase],
        }));
      },

      updatePurchase: (id, purchaseUpdate) => {
        set((state) => ({
          purchases: state.purchases.map((purchase) =>
            purchase.id === id ? { ...purchase, ...purchaseUpdate } : purchase
          ),
        }));
      },

      deletePurchase: (id) => {
        set((state) => ({
          purchases: state.purchases.filter((purchase) => purchase.id !== id),
        }));
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // API methods using backend
      fetchPurchases: async (fromDate?: Date, toDate?: Date) => {
        set({ loading: true, error: null });
        try {
          const purchases = await PurchaseService.getAll(fromDate, toDate);
          console.log("Purchases:", purchases);
          set({ purchases, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch purchases";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },

      fetchPurchasesByPumpMasterId: async (pumpMasterId: string) => {
        set({ loading: true, error: null });
        try {
          const purchases = await PurchaseService.getByPumpMasterId(
            pumpMasterId
          );
          console.log("Purchases by pump master:", purchases);
          set({ purchases, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch purchases by pump master";
          set({ error: errorMessage, loading: false });
        }
      },

      fetchPurchasesBySupplierId: async (
        supplierId: string,
        limit?: number
      ) => {
        set({ loading: true, error: null });
        try {
          const purchases = await PurchaseService.getBySupplierId(
            supplierId,
            limit
          );
          set({ purchases, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch purchases by supplier";
          set({ error: errorMessage, loading: false });
        }
      },

      createPurchase: async (purchase) => {
        set({ loading: true, error: null });
        try {
          const newPurchase = await PurchaseService.create(purchase);

          set((state) => ({
            purchases: [...state.purchases, newPurchase],
            loading: false,
          }));
          toast.success("Purchase created successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create purchase";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      editPurchase: async (id, purchaseUpdate) => {
        set({ loading: true, error: null });
        try {
          const updatedPurchase = await PurchaseService.update(
            id,
            purchaseUpdate
          );

          set((state) => ({
            purchases: state.purchases.map((purchase) =>
              purchase.id === id ? updatedPurchase : purchase
            ),
            loading: false,
          }));
          toast.success("Purchase updated successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update purchase";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      removePurchase: async (id) => {
        set({ loading: true, error: null });
        try {
          await PurchaseService.delete(id);

          set((state) => ({
            purchases: state.purchases.filter((purchase) => purchase.id !== id),
            loading: false,
          }));
          toast.success("Purchase deleted successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete purchase";
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getPurchaseById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const purchase = await PurchaseService.getById(id);
          set({ loading: false });
          return purchase;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch purchase";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },
    }),
    {
      name: "purchase-store",
    }
  )
);
