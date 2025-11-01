import api from "./api";
import type {
  ProfitReport,
  ProfitReportRequest,
  ProfitReportResponse,
} from "@/types/profit-report";

/**
 * Profit Report Service for Fuel Pump Management System
 *
 * This service handles fetching profit reports for different time periods.
 * Profit calculation focuses on fuel sales as the main revenue source.
 */
export class ProfitReportService {
  private static readonly BASE_PATH = "/api/v1/reports/profit";

  /**
   * Get profit report for a specific period (day, month, or year)
   * @param request - Period type and optional date
   * @returns Promise with profit report data
   */
  static async getProfitReport(
    request: ProfitReportRequest
  ): Promise<ProfitReport> {
    const params = new URLSearchParams();
    params.append("periodType", request.periodType);

    if (request.date) {
      params.append("date", request.date);
    }

    const url = `${this.BASE_PATH}?${params.toString()}`;
    const response = await api.get<ProfitReportResponse>(url);
    return response.data;
  }

  /**
   * Get today's profit report
   * @returns Promise with today's profit report
   */
  static async getTodayProfit(): Promise<ProfitReport> {
    const response = await api.get<ProfitReportResponse>(
      `${this.BASE_PATH}/today`
    );
    return response.data;
  }

  /**
   * Get current month's profit report
   * @returns Promise with current month's profit report
   */
  static async getMonthProfit(): Promise<ProfitReport> {
    const response = await api.get<ProfitReportResponse>(
      `${this.BASE_PATH}/month`
    );
    return response.data;
  }

  /**
   * Get current year's profit report
   * @returns Promise with current year's profit report
   */
  static async getYearProfit(): Promise<ProfitReport> {
    const response = await api.get<ProfitReportResponse>(
      `${this.BASE_PATH}/year`
    );
    return response.data;
  }

  /**
   * Get profit report for a specific date
   * @param date - Date in YYYY-MM-DD format
   * @returns Promise with profit report for the specified date
   */
  static async getProfitByDate(date: string): Promise<ProfitReport> {
    const response = await api.get<ProfitReportResponse>(
      `${this.BASE_PATH}/date/${date}`
    );
    return response.data;
  }

  /**
   * Get profit report for a specific month
   * @param year - Year (e.g., 2024)
   * @param month - Month (1-12)
   * @returns Promise with profit report for the specified month
   */
  static async getProfitByMonth(
    year: number,
    month: number
  ): Promise<ProfitReport> {
    const response = await api.get<ProfitReportResponse>(
      `${this.BASE_PATH}/month/${year}/${month}`
    );
    return response.data;
  }

  /**
   * Get profit report for a specific year
   * @param year - Year (e.g., 2024)
   * @returns Promise with profit report for the specified year
   */
  static async getProfitByYear(year: number): Promise<ProfitReport> {
    const response = await api.get<ProfitReportResponse>(
      `${this.BASE_PATH}/year/${year}`
    );
    return response.data;
  }

  /**
   * Get profit report for a custom date range
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Promise with profit report for the specified date range
   */
  static async getProfitByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ProfitReport> {
    const response = await api.get<ProfitReportResponse>(
      `${this.BASE_PATH}/range`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  }
}
