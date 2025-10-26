import { create } from "zustand";
import { ExpenseService } from "@/services/expense-service";
import type {
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseType,
} from "@/types";

interface ExpenseState {
  expenses: ExpenseResponse[];
  loading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  fetchExpensesByType: (expenseType: ExpenseType) => Promise<void>;
  fetchExpensesByDateRange: (
    startDate: string,
    endDate: string
  ) => Promise<void>;
  fetchExpensesBySalesmanNozzleShiftId: (shiftId: string) => Promise<void>;
  fetchExpensesByBankAccountId: (bankAccountId: string) => Promise<void>;
  addExpense: (request: CreateExpenseRequest) => Promise<ExpenseResponse>;
  updateExpense: (
    id: string,
    request: UpdateExpenseRequest
  ) => Promise<ExpenseResponse>;
  removeExpense: (id: string) => Promise<void>;
  searchExpenses: (params: {
    expenseHeadId?: string;
    expenseType?: ExpenseType;
    salesmanNozzleShiftId?: string;
    bankAccountId?: string;
    startDate?: string;
    endDate?: string;
    referenceNumber?: string;
  }) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseService.getAll();
      const expenses = Array.isArray(response) ? response : [];
      set({ expenses, loading: false });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch expenses",
        loading: false,
        expenses: [],
      });
      throw error;
    }
  },

  fetchExpensesByType: async (expenseType: ExpenseType) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseService.getByPumpMasterIdAndType(
        expenseType
      );
      const expenses = Array.isArray(response) ? response : [];
      set({ expenses, loading: false });
    } catch (error) {
      console.error("Error fetching expenses by type:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch expenses",
        loading: false,
        expenses: [],
      });
      throw error;
    }
  },

  fetchExpensesByDateRange: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseService.getByDateRange(startDate, endDate);
      const expenses = Array.isArray(response) ? response : [];
      set({ expenses, loading: false });
    } catch (error) {
      console.error("Error fetching expenses by date range:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch expenses",
        loading: false,
        expenses: [],
      });
      throw error;
    }
  },

  fetchExpensesBySalesmanNozzleShiftId: async (shiftId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseService.getBySalesmanNozzleShiftId(shiftId);
      const expenses = Array.isArray(response) ? response : [];
      set({ expenses, loading: false });
    } catch (error) {
      console.error("Error fetching expenses by shift:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch expenses",
        loading: false,
        expenses: [],
      });
      throw error;
    }
  },

  fetchExpensesByBankAccountId: async (bankAccountId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseService.getByBankAccountId(bankAccountId);
      const expenses = Array.isArray(response) ? response : [];
      set({ expenses, loading: false });
    } catch (error) {
      console.error("Error fetching expenses by bank account:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch expenses",
        loading: false,
        expenses: [],
      });
      throw error;
    }
  },

  addExpense: async (request: CreateExpenseRequest) => {
    set({ loading: true, error: null });
    try {
      const newExpense = await ExpenseService.create(request);
      set((state) => ({
        expenses: [...state.expenses, newExpense],
        loading: false,
      }));
      return newExpense;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create expense",
        loading: false,
      });
      throw error;
    }
  },

  updateExpense: async (id: string, request: UpdateExpenseRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedExpense = await ExpenseService.update(id, request);
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id ? updatedExpense : expense
        ),
        loading: false,
      }));
      return updatedExpense;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update expense",
        loading: false,
      });
      throw error;
    }
  },

  removeExpense: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await ExpenseService.delete(id);
      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete expense",
        loading: false,
      });
      throw error;
    }
  },

  searchExpenses: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await ExpenseService.search(params);
      const expenses = Array.isArray(response) ? response : [];
      set({ expenses, loading: false });
    } catch (error) {
      console.error("Error searching expenses:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to search expenses",
        loading: false,
        expenses: [],
      });
      throw error;
    }
  },
}));
