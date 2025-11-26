import api from "./api";
import type { EmployeeLedgerResponse } from "@/types/employee-ledger";

export class EmployeeLedgerService {
  private static readonly BASE_PATH = "/api/v1/employees";

  /**
   * Get employee ledger data with date range
   */
  static async getEmployeeLedger(
    userId: string,
    fromDate: string,
    toDate: string
  ): Promise<EmployeeLedgerResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append("fromDate", fromDate);
    queryParams.append("toDate", toDate);

    const response = await api.get<EmployeeLedgerResponse>(
      `${this.BASE_PATH}/${userId}/ledger?${queryParams}`
    );
    return response.data;
  }

  /**
   * Get opening balance for a specific date
   */
  static async getOpeningBalance(
    userId: string,
    date: string
  ): Promise<number> {
    const queryParams = new URLSearchParams();
    queryParams.append("date", date);

    const response = await api.get<number>(
      `${this.BASE_PATH}/${userId}/opening-balance?${queryParams}`
    );
    return response.data;
  }

  /**
   * Get current balance as of a specific date
   */
  static async getCurrentBalance(
    userId: string,
    asOfDate: string
  ): Promise<number> {
    const queryParams = new URLSearchParams();
    queryParams.append("asOfDate", asOfDate);

    const response = await api.get<number>(
      `${this.BASE_PATH}/${userId}/current-balance?${queryParams}`
    );
    return response.data;
  }
}
