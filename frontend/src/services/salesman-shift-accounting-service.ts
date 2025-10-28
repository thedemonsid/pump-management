import api from "./api";
import type {
  SalesmanShiftAccountingResponse,
  CreateSalesmanShiftAccountingRequest,
  UpdateSalesmanShiftAccountingRequest,
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
    id: string,
    request: UpdateSalesmanShiftAccountingRequest
  ): Promise<SalesmanShiftAccountingResponse> {
    const response = await api.put<SalesmanShiftAccountingResponse>(
      `${BASE_URL}/${id}`,
      request
    );
    return response.data;
  },

  /**
   * Delete accounting
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
