import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Manager } from "@/types";
import { ManagerService } from "@/services/manager-service";
import { toast } from "sonner";

interface ManagerState {
  managers: Manager[];
  loading: boolean;
  error: string | null;

  // Actions
  setManagers: (managers: Manager[]) => void;
  addManager: (manager: Manager) => void;
  updateManager: (id: string, manager: Partial<Manager>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchManagers: () => Promise<void>;
  createManager: (manager: {
    username: string;
    password: string;
    mobileNumber: string;
    email?: string;
    aadharNumber?: string;
    panNumber?: string;
    enabled?: boolean;
  }) => Promise<void>;
  editManager: (
    id: string,
    manager: {
      username?: string;
      password?: string;
      mobileNumber?: string;
      email?: string;
      aadharNumber?: string;
      panNumber?: string;
      enabled?: boolean;
    }
  ) => Promise<void>;
}

export const useManagerStore = create<ManagerState>()(
  devtools(
    (set, get) => ({
      managers: [],
      loading: false,
      error: null,

      setManagers: (managers) => set({ managers }),

      addManager: (manager) => {
        set((state) => ({
          managers: [...state.managers, manager],
        }));
      },

      updateManager: (id, updatedManager) =>
        set((state) => ({
          managers: state.managers.map((manager) =>
            manager.id === id ? { ...manager, ...updatedManager } : manager
          ),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // API methods
      fetchManagers: async () => {
        const { setLoading, setError, setManagers } = get();

        setLoading(true);
        setError(null);

        try {
          const managers = await ManagerService.getAll();
          setManagers(managers);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch managers";
          setError(errorMessage);
          console.error("Error fetching managers:", error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      createManager: async (managerData) => {
        const { setLoading, setError, addManager } = get();

        setLoading(true);
        setError(null);

        try {
          // Ensure email is always a string (empty string if undefined)
          const managerToCreate = {
            ...managerData,
            email: managerData.email ?? "",
          };

          const createdManager = await ManagerService.create(managerToCreate);
          addManager(createdManager);
          toast.success("Manager created successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create manager";
          setError(errorMessage);
          console.error("Error creating manager:", error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      editManager: async (id, managerData) => {
        const { setLoading, setError, updateManager } = get();

        setLoading(true);
        setError(null);

        try {
          const updatedManager = await ManagerService.update(id, managerData);
          updateManager(id, updatedManager);
          toast.success("Manager updated successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update manager";
          setError(errorMessage);
          console.error("Error updating manager:", error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },
    }),
    { name: "ManagerStore" }
  )
);
