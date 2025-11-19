import api from "./api";
import type {
  EmployeeSalaryPayment,
  CreateEmployeeSalaryPayment,
  UpdateEmployeeSalaryPayment,
  PaymentPeriodParams,
  EmployeeBalanceResponse,
} from "@/types";

export class EmployeeSalaryPaymentService {
  private static readonly BASE_PATH = "/api/v1/employee-salary-payments";

  // Get all salary payments
  static async getAll(): Promise<EmployeeSalaryPayment[]> {
    const response = await api.get<EmployeeSalaryPayment[]>(this.BASE_PATH);
    return response.data;
  }

  // Get salary payment by ID
  static async getById(id: string): Promise<EmployeeSalaryPayment> {
    const response = await api.get<EmployeeSalaryPayment>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get salary payments by user ID
  static async getByUserId(userId: string): Promise<EmployeeSalaryPayment[]> {
    const response = await api.get<EmployeeSalaryPayment[]>(
      `${this.BASE_PATH}/user/${userId}`
    );
    return response.data;
  }

  // Get total paid for user
  static async getTotalPaidByUserId(userId: string): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/user/${userId}/total`
    );
    return response.data;
  }

  // Get payments by calculated salary
  static async getByCalculatedSalaryId(
    calculatedSalaryId: string
  ): Promise<EmployeeSalaryPayment[]> {
    const response = await api.get<EmployeeSalaryPayment[]>(
      `${this.BASE_PATH}/calculated-salary/${calculatedSalaryId}`
    );
    return response.data;
  }

  // Get total paid for calculated salary
  static async getTotalPaidByCalculatedSalaryId(
    calculatedSalaryId: string
  ): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/calculated-salary/${calculatedSalaryId}/total`
    );
    return response.data;
  }

  // Get advance payments
  static async getAdvancePayments(): Promise<EmployeeSalaryPayment[]> {
    const response = await api.get<EmployeeSalaryPayment[]>(
      `${this.BASE_PATH}/advance`
    );
    return response.data;
  }

  // Get total payments in period
  static async getTotalInPeriod(params: PaymentPeriodParams): Promise<number> {
    const response = await api.get<number>(`${this.BASE_PATH}/period`, {
      params,
    });
    return response.data;
  }

  // Create new salary payment
  static async create(
    payment: CreateEmployeeSalaryPayment
  ): Promise<EmployeeSalaryPayment> {
    const response = await api.post<EmployeeSalaryPayment>(
      this.BASE_PATH,
      payment
    );
    return response.data;
  }

  // Update existing salary payment
  static async update(
    id: string,
    payment: UpdateEmployeeSalaryPayment
  ): Promise<EmployeeSalaryPayment> {
    const response = await api.put<EmployeeSalaryPayment>(
      `${this.BASE_PATH}/${id}`,
      payment
    );
    return response.data;
  }

  // Delete salary payment
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  // Calculate employee balance (custom method combining multiple API calls)
  // Fetches user's opening balance and calculates net balance
  static async calculateEmployeeBalance(
    userId: string
  ): Promise<EmployeeBalanceResponse> {
    try {
      // Import services dynamically to avoid circular dependency
      const { UserService } = await import("./user-service");
      const { CalculatedSalaryService } = await import(
        "./calculated-salary-service"
      );

      // Get user's opening balance
      const user = await UserService.getById(userId);
      const openingBalance = user.openingBalance || 0;

      // Get total calculated salary
      const totalSalary = await CalculatedSalaryService.getTotalByUserId(
        userId
      );

      // Get total paid
      const totalPaid = await this.getTotalPaidByUserId(userId);

      // Calculate net balance
      // Positive balance means company owes employee
      // Negative opening balance means employee owes company (e.g., loan)
      const netBalance = openingBalance + totalSalary - totalPaid;

      return {
        openingBalance,
        totalSalary,
        totalPaid,
        netBalance,
      };
    } catch (error) {
      console.error("Error calculating employee balance:", error);
      throw error;
    }
  }
}
