import api from "./api";
import type {
  ShiftResponse,
  ShiftDetailsResponse,
  StartShiftRequest,
  CloseShiftRequest,
  CreateShiftAccountingRequest,
  ShiftAccountingResponse,
} from "@/types";

export class SalesmanShiftService {
  private static readonly BASE_PATH = "/api/v1/salesman-shifts";

  static async getAll(params?: {
    fromDate?: string;
    toDate?: string;
    salesmanId?: string;
    status?: string;
  }): Promise<ShiftResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.fromDate)
      queryParams.append("fromDate", `${params.fromDate}T00:00:00`);
    if (params?.toDate)
      queryParams.append("toDate", `${params.toDate}T23:59:59`);
    if (params?.salesmanId) queryParams.append("salesmanId", params.salesmanId);
    if (params?.status) queryParams.append("status", params.status);

    const url = queryParams.toString()
      ? `${this.BASE_PATH}?${queryParams.toString()}`
      : this.BASE_PATH;
    const response = await api.get<ShiftResponse[]>(url);
    return response.data;
  }

  static async getById(id: string): Promise<ShiftDetailsResponse> {
    const response = await api.get<ShiftDetailsResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  static async startShift(payload: StartShiftRequest): Promise<ShiftResponse> {
    const response = await api.post<ShiftResponse>(this.BASE_PATH, payload);
    return response.data;
  }

  static async closeShift(
    id: string,
    payload?: CloseShiftRequest
  ): Promise<ShiftResponse> {
    const response = await api.put<ShiftResponse>(
      `${this.BASE_PATH}/${id}/close`,
      payload || {}
    );
    return response.data;
  }

  static async getActiveShifts(salesmanId?: string): Promise<ShiftResponse[]> {
    try {
      if (salesmanId) {
        // Get specific salesman's open shift
        const response = await api.get<ShiftResponse>(
          `${this.BASE_PATH}/salesman/${salesmanId}/open`
        );
        // Return as array for consistency
        return [response.data];
      } else {
        // Get all open shifts (admin only)
        const response = await api.get<ShiftResponse[]>(
          `${this.BASE_PATH}/open`
        );
        return response.data;
      }
    } catch (error: unknown) {
      // If 404, it means no open shift found - return empty array
      if (
        (error as { response?: { status?: number } })?.response?.status === 404
      ) {
        return [];
      }
      // Re-throw other errors
      throw error;
    }
  }

  static async getShiftsNeedingAccounting(
    salesmanId: string
  ): Promise<ShiftResponse[]> {
    try {
      const response = await api.get<ShiftResponse[]>(
        `${this.BASE_PATH}/salesman/${salesmanId}/pending-accounting`
      );
      return response.data;
    } catch (error: unknown) {
      // If 404, return empty array
      if (
        (error as { response?: { status?: number } })?.response?.status === 404
      ) {
        return [];
      }
      throw error;
    }
  }

  // Accounting
  static async createAccounting(
    shiftId: string,
    accountingData: CreateShiftAccountingRequest
  ): Promise<ShiftAccountingResponse> {
    const response = await api.post<ShiftAccountingResponse>(
      `${this.BASE_PATH}/${shiftId}/accounting`,
      accountingData
    );
    return response.data;
  }

  static async getAccounting(
    shiftId: string
  ): Promise<ShiftAccountingResponse> {
    const response = await api.get<ShiftAccountingResponse>(
      `${this.BASE_PATH}/${shiftId}/accounting`
    );
    return response.data;
  }

  static async updateAccounting(
    shiftId: string,
    accountingData: CreateShiftAccountingRequest
  ): Promise<ShiftAccountingResponse> {
    const response = await api.put<ShiftAccountingResponse>(
      `${this.BASE_PATH}/${shiftId}/accounting`,
      accountingData
    );
    return response.data;
  }

  // Admin helpers
  static async adminCreate(payload: StartShiftRequest): Promise<ShiftResponse> {
    const response = await api.post<ShiftResponse>(
      `${this.BASE_PATH}/admin`,
      payload
    );
    return response.data;
  }

  static async adminClose(id: string): Promise<ShiftResponse> {
    const response = await api.put<ShiftResponse>(
      `${this.BASE_PATH}/${id}/admin/close`
    );
    return response.data;
  }

  static async adminUpdate(
    id: string,
    updateData: Partial<StartShiftRequest>
  ): Promise<ShiftResponse> {
    const response = await api.put<ShiftResponse>(
      `${this.BASE_PATH}/${id}/admin`,
      updateData
    );
    return response.data;
  }
}
