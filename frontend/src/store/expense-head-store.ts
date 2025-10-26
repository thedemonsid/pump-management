import { create } from "zustand";
import { ExpenseHeadService } from "@/services/expense-head-service";
import type {
  ExpenseHeadResponse,
  CreateExpenseHeadRequest,
  UpdateExpenseHeadRequest,
} from "@/types";

interface ExpenseHeadState {
  expenseHeads: ExpenseHeadResponse[];
  loading: boolean;
  error: string | null;
  fetchExpenseHeads: () => Promise<void>;
  fetchActiveExpenseHeads: () => Promise<void>;
  addExpenseHead: (
    request: CreateExpenseHeadRequest
  ) => Promise<ExpenseHeadResponse>;
  updateExpenseHead: (
    id: string,
    request: UpdateExpenseHeadRequest
  ) => Promise<ExpenseHeadResponse>;
  removeExpenseHead: (id: string) => Promise<void>;
  toggleExpenseHeadActive: (id: string) => Promise<ExpenseHeadResponse>;
}

export const useExpenseHeadStore = create<ExpenseHeadState>((set) => ({
  expenseHeads: [],
  loading: false,
  error: null,

  fetchExpenseHeads: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseHeadService.getAll();
      console.log("Expense heads response:", response);
      const expenseHeads = Array.isArray(response) ? response : [];
      set({ expenseHeads, loading: false });
    } catch (error) {
      console.error("Error fetching expense heads:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch expense heads",
        loading: false,
        expenseHeads: [],
      });
      throw error;
    }
  },

  fetchActiveExpenseHeads: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseHeadService.getActive();
      const expenseHeads = Array.isArray(response) ? response : [];
      set({ expenseHeads, loading: false });
    } catch (error) {
      console.error("Error fetching active expense heads:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch active expense heads",
        loading: false,
        expenseHeads: [],
      });
      throw error;
    }
  },

  addExpenseHead: async (request: CreateExpenseHeadRequest) => {
    set({ loading: true, error: null });
    try {
      const newExpenseHead = await ExpenseHeadService.create(request);
      set((state) => ({
        expenseHeads: [...state.expenseHeads, newExpenseHead],
        loading: false,
      }));
      return newExpenseHead;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create expense head",
        loading: false,
      });
      throw error;
    }
  },

  updateExpenseHead: async (id: string, request: UpdateExpenseHeadRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedExpenseHead = await ExpenseHeadService.update(id, request);
      set((state) => ({
        expenseHeads: state.expenseHeads.map((head) =>
          head.id === id ? updatedExpenseHead : head
        ),
        loading: false,
      }));
      return updatedExpenseHead;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update expense head",
        loading: false,
      });
      throw error;
    }
  },

  removeExpenseHead: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await ExpenseHeadService.delete(id);
      set((state) => ({
        expenseHeads: state.expenseHeads.filter((head) => head.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete expense head",
        loading: false,
      });
      throw error;
    }
  },

  toggleExpenseHeadActive: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const updatedExpenseHead = await ExpenseHeadService.toggleActive(id);
      set((state) => ({
        expenseHeads: state.expenseHeads.map((head) =>
          head.id === id ? updatedExpenseHead : head
        ),
        loading: false,
      }));
      return updatedExpenseHead;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle expense head status",
        loading: false,
      });
      throw error;
    }
  },
}));
