import api from "./api";
import type {
  CalculatedSalary,
  CreateCalculatedSalary,
  UpdateCalculatedSalary,
  SalaryPeriodParams,
} from "@/types";

export class CalculatedSalaryService {
  private static readonly BASE_PATH = "/api/v1/calculated-salaries";

  // Get all calculated salaries
  static async getAll(): Promise<CalculatedSalary[]> {
    const response = await api.get<CalculatedSalary[]>(this.BASE_PATH);
    return response.data;
  }

  // Get calculated salary by ID
  static async getById(id: string): Promise<CalculatedSalary> {
    const response = await api.get<CalculatedSalary>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get calculated salaries by user ID
  static async getByUserId(userId: string): Promise<CalculatedSalary[]> {
    const response = await api.get<CalculatedSalary[]>(
      `${this.BASE_PATH}/user/${userId}`
    );
    return response.data;
  }

  // Get total salary for user
  static async getTotalByUserId(userId: string): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/user/${userId}/total`
    );
    return response.data;
  }

  // Get calculated salaries by date range
  static async getByDateRange(
    params: SalaryPeriodParams
  ): Promise<CalculatedSalary[]> {
    const response = await api.get<CalculatedSalary[]>(
      `${this.BASE_PATH}/date-range`,
      {
        params,
      }
    );
    return response.data;
  }

  // Get calculated salaries by salary config
  static async getBySalaryConfigId(
    salaryConfigId: string
  ): Promise<CalculatedSalary[]> {
    const response = await api.get<CalculatedSalary[]>(
      `${this.BASE_PATH}/salary-config/${salaryConfigId}`
    );
    return response.data;
  }

  // Create new calculated salary
  static async create(
    salary: CreateCalculatedSalary
  ): Promise<CalculatedSalary> {
    const response = await api.post<CalculatedSalary>(this.BASE_PATH, salary);
    return response.data;
  }

  // Update existing calculated salary
  static async update(
    id: string,
    salary: UpdateCalculatedSalary
  ): Promise<CalculatedSalary> {
    const response = await api.put<CalculatedSalary>(
      `${this.BASE_PATH}/${id}`,
      salary
    );
    return response.data;
  }

  // Delete calculated salary
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
