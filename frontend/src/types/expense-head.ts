export interface ExpenseHead {
  id: string;
  pumpMasterId: string;
  headName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseHeadResponse {
  id: string;
  pumpMasterId: string;
  headName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseHeadRequest {
  pumpMasterId?: string;
  headName: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateExpenseHeadRequest {
  headName?: string;
  description?: string;
  isActive?: boolean;
}
