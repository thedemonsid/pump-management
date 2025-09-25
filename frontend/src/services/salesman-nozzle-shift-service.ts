import api from './api';
import type {
  SalesmanNozzleShift,
  CreateSalesmanNozzleShift,
  CloseSalesmanNozzleShift,
} from '@/types';

export class SalesmanNozzleShiftService {
  private static readonly BASE_PATH = '/api/v1/salesman-nozzle-shifts';

  // Get all shifts for the current salesman (with optional date filtering)
  static async getAll(params?: {
    fromDate?: string;
    toDate?: string;
    salesmanId?: string;
  }): Promise<SalesmanNozzleShift[]> {
    const queryParams = new URLSearchParams();
    if (params?.fromDate) {
      // Convert date-only string to LocalDateTime format (start of day)
      queryParams.append('fromDate', `${params.fromDate}T00:00:00`);
    }
    if (params?.toDate) {
      // Convert date-only string to LocalDateTime format (end of day)
      queryParams.append('toDate', `${params.toDate}T23:59:59`);
    }
    if (params?.salesmanId) {
      queryParams.append('salesmanId', params.salesmanId);
    }

    const url = queryParams.toString()
      ? `${this.BASE_PATH}?${queryParams.toString()}`
      : this.BASE_PATH;

    console.log('Making API call to:', url);
    try {
      const response = await api.get<SalesmanNozzleShift[]>(url);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Get shift by ID
  static async getById(id: string): Promise<SalesmanNozzleShift> {
    const response = await api.get<SalesmanNozzleShift>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Start a new shift
  static async create(
    shift: CreateSalesmanNozzleShift
  ): Promise<SalesmanNozzleShift> {
    const response = await api.post<SalesmanNozzleShift>(this.BASE_PATH, shift);
    return response.data;
  }

  // Close an existing shift
  static async close(
    id: string,
    closeData: CloseSalesmanNozzleShift
  ): Promise<SalesmanNozzleShift> {
    const response = await api.put<SalesmanNozzleShift>(
      `${this.BASE_PATH}/${id}/close`,
      closeData
    );
    return response.data;
  }

  // Get active/open shifts for the current salesman
  static async getActiveShifts(
    salesmanId: string
  ): Promise<SalesmanNozzleShift[]> {
    const response = await api.get(
      `/api/v1/salesman-nozzle-shifts/open?salesmanId=${salesmanId}`
    );
    return response.data;
  }

  // Get all shifts for a specific nozzle (admin endpoint)
  static async getByNozzleId(nozzleId: string): Promise<SalesmanNozzleShift[]> {
    const response = await api.get<SalesmanNozzleShift[]>(
      `${this.BASE_PATH}/nozzle/${nozzleId}`
    );
    return response.data;
  }

  // Delete a shift (admin endpoint)
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}/admin`);
  }

  // Admin create shift
  static async adminCreate(
    shift: CreateSalesmanNozzleShift
  ): Promise<SalesmanNozzleShift> {
    const response = await api.post<SalesmanNozzleShift>(
      `${this.BASE_PATH}/admin`,
      shift
    );
    return response.data;
  }

  // Admin close shift
  static async adminClose(
    id: string,
    closeData: CloseSalesmanNozzleShift
  ): Promise<SalesmanNozzleShift> {
    const response = await api.put<SalesmanNozzleShift>(
      `${this.BASE_PATH}/${id}/admin/close`,
      closeData
    );
    return response.data;
  }

  // Admin update shift
  static async adminUpdate(
    id: string,
    updateData: Partial<CreateSalesmanNozzleShift>
  ): Promise<SalesmanNozzleShift> {
    const response = await api.put<SalesmanNozzleShift>(
      `${this.BASE_PATH}/${id}/admin`,
      updateData
    );
    return response.data;
  }
}
