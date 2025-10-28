export type ExpenseType = "SHIFT" | "BANK_ACCOUNT";

export const ExpenseTypeEnum = {
  SHIFT: "SHIFT" as ExpenseType,
  BANK_ACCOUNT: "BANK_ACCOUNT" as ExpenseType,
};

export interface Expense {
  id: string;
  pumpMasterId: string;
  expenseHeadId: string;
  expenseHeadName?: string;
  expenseType: ExpenseType;
  salesmanShiftId?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  expenseDate: string;
  amount: number;
  remarks?: string;
  referenceNumber?: string;
  fileStorageId?: string;
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
  salesmanShiftId?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  expenseDate: string;
  amount: number;
  remarks?: string;
  referenceNumber?: string;
  fileStorageId?: string;
  createdAt: string;
  updatedAt: string;
  entryBy?: string;
}

export interface CreateExpenseRequest {
  pumpMasterId?: string;
  expenseHeadId: string;
  expenseType: ExpenseType;
  salesmanShiftId?: string;
  bankAccountId?: string;
  paymentMethod?: string;
  expenseDate: string;
  amount: number;
  remarks?: string;
  referenceNumber?: string;
  fileStorageId?: string;
}

export interface UpdateExpenseRequest {
  expenseHeadId?: string;
  expenseType?: ExpenseType;
  salesmanShiftId?: string;
  bankAccountId?: string;
  paymentMethod?: string;
  expenseDate?: string;
  amount?: number;
  remarks?: string;
  referenceNumber?: string;
  fileStorageId?: string;
}
