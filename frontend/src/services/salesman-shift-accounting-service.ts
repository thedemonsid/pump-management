import api from "./api";
import type {
  SalesmanShiftAccountingResponse,
  CreateSalesmanShiftAccountingRequest,
  UpdateSalesmanShiftAccountingRequest,
  CashDistributionRequest,
  CashDistributionResponse,
} from "@/types/salesman-shift-accounting";

const BASE_URL = "/api/salesman-shift-accounting";

export const SalesmanShiftAccountingService = {
  /**
   * Get accounting by shift ID
   */
  async getByShiftId(
    shiftId: string
  ): Promise<SalesmanShiftAccountingResponse> {
    const response = await api.get<SalesmanShiftAccountingResponse>(
      `${BASE_URL}/shift/${shiftId}`
    );
    return response.data;
  },

  /**
   * Create accounting for a shift
   */
  async create(
    shiftId: string,
    request: CreateSalesmanShiftAccountingRequest
  ): Promise<SalesmanShiftAccountingResponse> {
    const response = await api.post<SalesmanShiftAccountingResponse>(
      `${BASE_URL}/shift/${shiftId}`,
      request
    );
    return response.data;
  },

  /**
   * Update accounting
   */
  async update(
    shiftId: string,
    request: UpdateSalesmanShiftAccountingRequest
  ): Promise<SalesmanShiftAccountingResponse> {
    const response = await api.put<SalesmanShiftAccountingResponse>(
      `${BASE_URL}/shift/${shiftId}`,
      request
    );
    return response.data;
  },

  /**
   * Delete accounting by shift ID
   */
  async delete(shiftId: string): Promise<void> {
    await api.delete(`${BASE_URL}/shift/${shiftId}`);
  },

  // ==================== CASH DISTRIBUTION METHODS ====================

  /**
   * Distribute cash from shift accounting to bank accounts
   */
  async distributeCash(
    shiftId: string,
    request: CashDistributionRequest
  ): Promise<CashDistributionResponse[]> {
    const response = await api.post<CashDistributionResponse[]>(
      `${BASE_URL}/shift/${shiftId}/distributions`,
      request
    );
    return response.data;
  },

  /**
   * Get all cash distributions for a shift
   */
  async getCashDistributions(
    shiftId: string
  ): Promise<CashDistributionResponse[]> {
    const response = await api.get<CashDistributionResponse[]>(
      `${BASE_URL}/shift/${shiftId}/distributions`
    );
    return response.data;
  },

  /**
   * Get total distributed amount for a shift
   */
  async getTotalDistributed(shiftId: string): Promise<number> {
    const response = await api.get<number>(
      `${BASE_URL}/shift/${shiftId}/distributions/total`
    );
    return response.data;
  },

  /**
   * Delete all cash distributions for a shift
   */
  async deleteCashDistributions(shiftId: string): Promise<void> {
    await api.delete(`${BASE_URL}/shift/${shiftId}/distributions`);
  },

  /**
   * Delete a single cash distribution transaction
   */
  async deleteCashDistribution(transactionId: string): Promise<void> {
    await api.delete(`${BASE_URL}/distributions/${transactionId}`);
  },
};
