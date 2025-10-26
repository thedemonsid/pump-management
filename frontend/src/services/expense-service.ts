import api from "./api";
import type {
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseType,
} from "@/types";

export class ExpenseService {
  private static readonly BASE_PATH = "/api/v1/expenses";

  // Get all expenses
  static async getAll(): Promise<ExpenseResponse[]> {
    const response = await api.get<ExpenseResponse[]>(this.BASE_PATH);
    return response.data;
  }

  // Get expense by ID
  static async getById(id: string): Promise<ExpenseResponse> {
    const response = await api.get<ExpenseResponse>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get expenses by expense head ID
  static async getByExpenseHeadId(
    expenseHeadId: string
  ): Promise<ExpenseResponse[]> {
    const response = await api.get<ExpenseResponse[]>(
      `${this.BASE_PATH}/expense-head/${expenseHeadId}`
    );
    return response.data;
  }

  // Get expenses by expense type
  static async getByType(expenseType: ExpenseType): Promise<ExpenseResponse[]> {
    const response = await api.get<ExpenseResponse[]>(
      `${this.BASE_PATH}/type/${expenseType}`
    );
    return response.data;
  }

  // Get expenses by pump master ID and expense type
  static async getByPumpMasterIdAndType(
    expenseType: ExpenseType
  ): Promise<ExpenseResponse[]> {
    const response = await api.get<ExpenseResponse[]>(
      `${this.BASE_PATH}/type?expenseType=${expenseType}`
    );
    return response.data;
  }

  // Get expenses by salesman nozzle shift ID
  static async getBySalesmanNozzleShiftId(
    salesmanNozzleShiftId: string
  ): Promise<ExpenseResponse[]> {
    const response = await api.get<ExpenseResponse[]>(
      `${this.BASE_PATH}/nozzle-shift/${salesmanNozzleShiftId}`
    );
    return response.data;
  }

  // Get expenses by bank account ID
  static async getByBankAccountId(
    bankAccountId: string
  ): Promise<ExpenseResponse[]> {
    const response = await api.get<ExpenseResponse[]>(
      `${this.BASE_PATH}/bank-account/${bankAccountId}`
    );
    return response.data;
  }

  // Get expenses by date range
  static async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ExpenseResponse[]> {
    const response = await api.get<ExpenseResponse[]>(
      `${this.BASE_PATH}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  // Search expenses with multiple criteria
  static async search(params: {
    expenseHeadId?: string;
    expenseType?: ExpenseType;
    salesmanNozzleShiftId?: string;
    bankAccountId?: string;
    startDate?: string;
    endDate?: string;
    referenceNumber?: string;
  }): Promise<ExpenseResponse[]> {
    const searchParams = new URLSearchParams();
    if (params.expenseHeadId)
      searchParams.append("expenseHeadId", params.expenseHeadId);
    if (params.expenseType)
      searchParams.append("expenseType", params.expenseType);
    if (params.salesmanNozzleShiftId)
      searchParams.append(
        "salesmanNozzleShiftId",
        params.salesmanNozzleShiftId
      );
    if (params.bankAccountId)
      searchParams.append("bankAccountId", params.bankAccountId);
    if (params.startDate) searchParams.append("startDate", params.startDate);
    if (params.endDate) searchParams.append("endDate", params.endDate);
    if (params.referenceNumber)
      searchParams.append("referenceNumber", params.referenceNumber);

    const response = await api.get<ExpenseResponse[]>(
      `${this.BASE_PATH}/search?${searchParams.toString()}`
    );
    return response.data;
  }

  // Get total count of expenses
  static async getCount(): Promise<number> {
    const response = await api.get<number>(`${this.BASE_PATH}/count`);
    return response.data;
  }

  // Get count of expenses by type
  static async getCountByType(expenseType: ExpenseType): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/count/type/${expenseType}`
    );
    return response.data;
  }

  // Get sum of all expense amounts
  static async getSumTotal(): Promise<number> {
    const response = await api.get<number>(`${this.BASE_PATH}/sum/total`);
    return response.data;
  }

  // Get sum of expense amounts by date range
  static async getSumByDateRange(
    startDate: string,
    endDate: string
  ): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/sum/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  // Get sum of expense amounts by salesman nozzle shift
  static async getSumBySalesmanNozzleShift(
    salesmanNozzleShiftId: string
  ): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/sum/nozzle-shift/${salesmanNozzleShiftId}`
    );
    return response.data;
  }

  // Get sum of expense amounts by bank account and date range
  static async getSumByBankAccountAndDateRange(
    bankAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/sum/bank-account/${bankAccountId}?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  // Create new expense
  static async create(request: CreateExpenseRequest): Promise<ExpenseResponse> {
    const response = await api.post<ExpenseResponse>(this.BASE_PATH, request);
    return response.data;
  }

  // Update existing expense
  static async update(
    id: string,
    request: UpdateExpenseRequest
  ): Promise<ExpenseResponse> {
    const response = await api.put<ExpenseResponse>(
      `${this.BASE_PATH}/${id}`,
      request
    );
    return response.data;
  }

  // Delete expense
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  // Get paginated expenses
  static async getPaginated(
    page: number = 0,
    size: number = 10,
    sortBy: string = "expenseDate",
    sortDirection: "ASC" | "DESC" = "DESC"
  ): Promise<{
    content: ExpenseResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const response = await api.get(
      `${this.BASE_PATH}/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    );
    return response.data;
  }
}
