import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserAbsence } from "@/types";
import { UserAbsenceService } from "@/services/user-absence-service";
import { toast } from "sonner";

interface UserAbsenceState {
  absences: UserAbsence[];
  loading: boolean;
  error: string | null;

  // Actions
  setAbsences: (absences: UserAbsence[]) => void;
  addAbsence: (absence: UserAbsence) => void;
  updateAbsence: (id: string, absence: Partial<UserAbsence>) => void;
  deleteAbsence: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API methods
  fetchAbsences: () => Promise<void>;
  fetchAbsencesByUser: (userId: string) => Promise<void>;
  fetchAbsencesByDateRange: (
    startDate: string,
    endDate: string
  ) => Promise<void>;
  fetchAbsencesByApproval: (isApproved: boolean) => Promise<void>;
  createAbsence: (absence: {
    userId: string;
    absenceDate: string;
    reason?: string;
    notes?: string;
    isApproved?: boolean;
  }) => Promise<void>;
  editAbsence: (
    id: string,
    absence: {
      absenceDate?: string;
      reason?: string;
      notes?: string;
      isApproved?: boolean;
    }
  ) => Promise<void>;
  removeAbsence: (id: string) => Promise<void>;
  approveAbsence: (id: string) => Promise<void>;
}

export const useUserAbsenceStore = create<UserAbsenceState>()(
  devtools(
    (set, get) => ({
      absences: [],
      loading: false,
      error: null,

      setAbsences: (absences) => set({ absences }),

      addAbsence: (absence) => {
        set((state) => ({
          absences: [...state.absences, absence],
        }));
      },

      updateAbsence: (id, updatedAbsence) =>
        set((state) => ({
          absences: state.absences.map((absence) =>
            absence.id === id ? { ...absence, ...updatedAbsence } : absence
          ),
        })),

      deleteAbsence: (id) =>
        set((state) => ({
          absences: state.absences.filter((absence) => absence.id !== id),
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // API methods
      fetchAbsences: async () => {
        const { setLoading, setError, setAbsences } = get();

        setLoading(true);
        setError(null);

        try {
          const absences = await UserAbsenceService.getAll();
          setAbsences(absences);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch absences";
          setError(errorMessage);
          console.error("Error fetching absences:", error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      fetchAbsencesByUser: async (userId: string) => {
        const { setLoading, setError, setAbsences } = get();

        setLoading(true);
        setError(null);

        try {
          const absences = await UserAbsenceService.getByUserId(userId);
          setAbsences(absences);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user absences";
          setError(errorMessage);
          console.error("Error fetching user absences:", error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      fetchAbsencesByDateRange: async (startDate: string, endDate: string) => {
        const { setLoading, setError, setAbsences } = get();

        setLoading(true);
        setError(null);

        try {
          const absences = await UserAbsenceService.getByDateRange(
            startDate,
            endDate
          );
          setAbsences(absences);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch absences by date range";
          setError(errorMessage);
          console.error("Error fetching absences by date range:", error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      fetchAbsencesByApproval: async (isApproved: boolean) => {
        const { setLoading, setError, setAbsences } = get();

        setLoading(true);
        setError(null);

        try {
          const absences = await UserAbsenceService.getByApprovalStatus(
            isApproved
          );
          setAbsences(absences);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch absences by approval status";
          setError(errorMessage);
          console.error("Error fetching absences by approval status:", error);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      },

      createAbsence: async (absenceData) => {
        const { setLoading, setError, addAbsence } = get();

        setLoading(true);
        setError(null);

        try {
          // Default isApproved to true when creating absence
          const createdAbsence = await UserAbsenceService.create({
            ...absenceData,
            isApproved: true,
          });
          addAbsence(createdAbsence);
          toast.success("Absence record created successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create absence record";
          setError(errorMessage);
          console.error("Error creating absence:", error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      editAbsence: async (id, absenceData) => {
        const { setLoading, setError, updateAbsence } = get();

        setLoading(true);
        setError(null);

        try {
          const updatedAbsence = await UserAbsenceService.update(
            id,
            absenceData
          );
          updateAbsence(id, updatedAbsence);
          toast.success("Absence record updated successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update absence record";
          setError(errorMessage);
          console.error("Error updating absence:", error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      removeAbsence: async (id: string) => {
        const { setLoading, setError, deleteAbsence } = get();

        setLoading(true);
        setError(null);

        try {
          await UserAbsenceService.delete(id);
          deleteAbsence(id);
          toast.success("Absence record deleted successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete absence record";
          setError(errorMessage);
          console.error("Error deleting absence:", error);
          toast.error(errorMessage);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      approveAbsence: async (id: string) => {
        const { editAbsence } = get();

        try {
          await editAbsence(id, { isApproved: true });
        } catch (error) {
          console.error("Error approving absence:", error);
          throw error;
        }
      },
    }),
    { name: "UserAbsenceStore" }
  )
);
