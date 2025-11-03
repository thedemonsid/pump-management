import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Salesman } from "@/types";
import { SalesmanService } from "@/services/api";
import { toast } from "sonner";

interface SalesmanState {
  salesmen: Salesman[];
  loading: boolean;
  error: string | null;

  // Actions
  setSalesmen: (salesmen: Salesman[]) => void;
  addSalesman: (salesman: Salesman) => void;
  updateSalesman: (id: string, salesman: Partial<Salesman>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchSalesmen: () => Promise<void>;
  createSalesman: (
    salesman: Omit<
      Salesman,
      "id" | "createdAt" | "updatedAt" | "pumpMasterId"
    > & { password: string }
  ) => Promise<void>;
  editSalesman: (id: string, salesman: Partial<Salesman>) => Promise<void>;
}

export const useSalesmanStore = create<SalesmanState>()(
  devtools(
    (set, get) => ({
      salesmen: [],
      loading: false,
      error: null,

      setSalesmen: (salesmen) => set({ salesmen }),

      addSalesman: (salesman) => {
        set((state) => ({
          salesmen: [...state.salesmen, salesman],
        }));
      },

      updateSalesman: (id, updatedSalesman) =>
        set((state) => ({
          salesmen: state.salesmen.map((salesman) =>
            salesman.id === id ? { ...salesman, ...updatedSalesman } : salesman
          ),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // API methods
      fetchSalesmen: async () => {
        const { setLoading, setError, setSalesmen } = get();

        setLoading(true);
        setError(null);

        try {
          const salesmen = await SalesmanService.getAll();
          setSalesmen(salesmen);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch salesmen";
          setError(errorMessage);
          console.error("Error fetching salesmen:", error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      createSalesman: async (salesmanData) => {
        const { setLoading, setError, addSalesman } = get();

        setLoading(true);
        setError(null);

        try {
          // Ensure email is always a string (empty string if undefined)
          const salesmanToCreateWithEmail = {
            ...salesmanData,
            email: salesmanData.email ?? "",
          };

          const createdSalesman = await SalesmanService.create(
            salesmanToCreateWithEmail
          );
          addSalesman(createdSalesman);
          toast.success("Salesman created successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create salesman";
          setError(errorMessage);
          console.error("Error creating salesman:", error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      editSalesman: async (id, salesmanData) => {
        const { setLoading, setError, updateSalesman } = get();

        setLoading(true);
        setError(null);

        try {
          // Remove id, createdAt, updatedAt, version from the data
          const updateData = { ...salesmanData };
          delete updateData.id;
          delete updateData.createdAt;
          delete updateData.updatedAt;
          delete updateData.version;

          const updatedSalesman = await SalesmanService.update(
            id,
            updateData as Omit<
              Salesman,
              "id" | "createdAt" | "updatedAt" | "version"
            >
          );
          updateSalesman(id, updatedSalesman);
          toast.success("Salesman updated successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update salesman";
          setError(errorMessage);
          console.error("Error updating salesman:", error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },
    }),
    { name: "salesman-store" }
  )
);
