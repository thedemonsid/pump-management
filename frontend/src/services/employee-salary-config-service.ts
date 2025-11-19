import api from "./api";
import type {
  EmployeeSalaryConfig,
  CreateEmployeeSalaryConfig,
  UpdateEmployeeSalaryConfig,
} from "@/types";

export class EmployeeSalaryConfigService {
  private static readonly BASE_PATH = "/api/v1/employee-salary-configs";

  // Get all salary configurations
  static async getAll(): Promise<EmployeeSalaryConfig[]> {
    const response = await api.get<EmployeeSalaryConfig[]>(this.BASE_PATH);
    return response.data;
  }

  // Get salary configuration by ID
  static async getById(id: string): Promise<EmployeeSalaryConfig> {
    const response = await api.get<EmployeeSalaryConfig>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get salary configurations by user ID
  static async getByUserId(userId: string): Promise<EmployeeSalaryConfig[]> {
    const response = await api.get<EmployeeSalaryConfig[]>(
      `${this.BASE_PATH}/user/${userId}`
    );
    return response.data;
  }

  // Get active salary configuration for user
  static async getActiveByUserId(
    userId: string
  ): Promise<EmployeeSalaryConfig> {
    const response = await api.get<EmployeeSalaryConfig>(
      `${this.BASE_PATH}/user/${userId}/active`
    );
    return response.data;
  }

  // Get configurations by status
  static async getByStatus(isActive: boolean): Promise<EmployeeSalaryConfig[]> {
    const response = await api.get<EmployeeSalaryConfig[]>(
      `${this.BASE_PATH}/status`,
      {
        params: { isActive },
      }
    );
    return response.data;
  }

  // Create new salary configuration
  static async create(
    config: CreateEmployeeSalaryConfig
  ): Promise<EmployeeSalaryConfig> {
    const response = await api.post<EmployeeSalaryConfig>(
      this.BASE_PATH,
      config
    );
    return response.data;
  }

  // Update existing salary configuration
  static async update(
    id: string,
    config: UpdateEmployeeSalaryConfig
  ): Promise<EmployeeSalaryConfig> {
    const response = await api.put<EmployeeSalaryConfig>(
      `${this.BASE_PATH}/${id}`,
      config
    );
    return response.data;
  }

  // Deactivate salary configuration
  static async deactivate(id: string): Promise<EmployeeSalaryConfig> {
    const response = await api.put<EmployeeSalaryConfig>(
      `${this.BASE_PATH}/${id}/deactivate`
    );
    return response.data;
  }

  // Delete salary configuration
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
