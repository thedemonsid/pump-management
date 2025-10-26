import api from "./api";
import type {
  ExpenseHeadResponse,
  CreateExpenseHeadRequest,
  UpdateExpenseHeadRequest,
} from "@/types";

export class ExpenseHeadService {
  private static readonly BASE_PATH = "/api/v1/expense-heads";

  // Get all expense heads
  static async getAll(): Promise<ExpenseHeadResponse[]> {
    const response = await api.get<ExpenseHeadResponse[]>(this.BASE_PATH);
    return response.data;
  }

  // Get active expense heads only
  static async getActive(): Promise<ExpenseHeadResponse[]> {
    const response = await api.get<ExpenseHeadResponse[]>(
      `${this.BASE_PATH}/active`
    );
    return response.data;
  }

  // Get expense head by ID
  static async getById(id: string): Promise<ExpenseHeadResponse> {
    const response = await api.get<ExpenseHeadResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get expense head by name
  static async getByName(headName: string): Promise<ExpenseHeadResponse> {
    const response = await api.get<ExpenseHeadResponse>(
      `${this.BASE_PATH}/name/${encodeURIComponent(headName)}`
    );
    return response.data;
  }

  // Create new expense head
  static async create(
    request: CreateExpenseHeadRequest
  ): Promise<ExpenseHeadResponse> {
    const response = await api.post<ExpenseHeadResponse>(
      this.BASE_PATH,
      request
    );
    return response.data;
  }

  // Update existing expense head
  static async update(
    id: string,
    request: UpdateExpenseHeadRequest
  ): Promise<ExpenseHeadResponse> {
    const response = await api.put<ExpenseHeadResponse>(
      `${this.BASE_PATH}/${id}`,
      request
    );
    return response.data;
  }

  // Delete expense head
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  // Toggle active status
  static async toggleActive(id: string): Promise<ExpenseHeadResponse> {
    const response = await api.patch<ExpenseHeadResponse>(
      `${this.BASE_PATH}/${id}/toggle-active`
    );
    return response.data;
  }

  // Search expense heads with filters
  static async search(
    headName?: string,
    isActive?: boolean
  ): Promise<ExpenseHeadResponse[]> {
    const params = new URLSearchParams();
    if (headName) params.append("headName", headName);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const response = await api.get<ExpenseHeadResponse[]>(
      `${this.BASE_PATH}/search?${params.toString()}`
    );
    return response.data;
  }

  // Get total count of expense heads
  static async getCount(): Promise<number> {
    const response = await api.get<number>(`${this.BASE_PATH}/count`);
    return response.data;
  }

  // Get count of active expense heads
  static async getActiveCount(): Promise<number> {
    const response = await api.get<number>(`${this.BASE_PATH}/count/active`);
    return response.data;
  }

  // Get paginated expense heads
  static async getPaginated(
    page: number = 0,
    size: number = 10,
    sortBy: string = "headName",
    sortDirection: "ASC" | "DESC" = "ASC"
  ): Promise<{
    content: ExpenseHeadResponse[];
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
