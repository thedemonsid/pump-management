export type ExpenseType = "NOZZLE_SHIFT" | "BANK_ACCOUNT";

export const ExpenseTypeEnum = {
  NOZZLE_SHIFT: "NOZZLE_SHIFT" as ExpenseType,
  BANK_ACCOUNT: "BANK_ACCOUNT" as ExpenseType,
};

export interface Expense {
  id: string;
  pumpMasterId: string;
  expenseHeadId: string;
  expenseHeadName?: string;
  expenseType: ExpenseType;
  salesmanNozzleShiftId?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  expenseDate: string;
  amount: number;
  remarks?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
  entryBy?: string;
}

export interface ExpenseResponse {
  id: string;
  pumpMasterId: string;
  expenseHeadId: string;
  expenseHeadName?: string;
  expenseType: ExpenseType;
  salesmanNozzleShiftId?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  expenseDate: string;
  amount: number;
  remarks?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
  entryBy?: string;
}

export interface CreateExpenseRequest {
  pumpMasterId?: string;
  expenseHeadId: string;
  expenseType: ExpenseType;
  salesmanNozzleShiftId?: string;
  bankAccountId?: string;
  expenseDate: string;
  amount: number;
  remarks?: string;
  referenceNumber?: string;
}

export interface UpdateExpenseRequest {
  expenseHeadId?: string;
  expenseType?: ExpenseType;
  salesmanNozzleShiftId?: string;
  bankAccountId?: string;
  expenseDate?: string;
  amount?: number;
  remarks?: string;
  referenceNumber?: string;
}
