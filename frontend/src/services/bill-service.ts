import api from './api';
import type {
  CreateBillRequest,
  UpdateBillRequest,
  BillResponse,
} from '@/types';

export class BillService {
  private static readonly BASE_PATH = '/api/v1/bills';

  // Get all bills
  static async getAll(): Promise<BillResponse[]> {
    const response = await api.get<BillResponse[]>(this.BASE_PATH);
    return response.data;
  }

  // Get bill by ID
  static async getById(id: string): Promise<BillResponse> {
    const response = await api.get<BillResponse>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get bills by pump master ID
  static async getByPumpMasterId(
    pumpMasterId: string
  ): Promise<BillResponse[]> {
    const response = await api.get<BillResponse[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Get bills by date range
  static async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<BillResponse[]> {
    const response = await api.get<BillResponse[]>(
      `${this.BASE_PATH}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  // Get bills by customer ID
  static async getByCustomerId(customerId: string): Promise<BillResponse[]> {
    const response = await api.get<BillResponse[]>(
      `${this.BASE_PATH}/customer/${customerId}`
    );
    return response.data;
  }

  // Get next bill number for pump master
  static async getNextBillNo(): Promise<number> {
    const response = await api.get<number>(`${this.BASE_PATH}/next-bill-no`);
    return response.data;
  }

  // Create new bill
  static async create(bill: CreateBillRequest): Promise<BillResponse> {
    const response = await api.post<BillResponse>(`${this.BASE_PATH}`, bill);
    return response.data;
  }

  // Update existing bill
  static async update(
    id: string,
    bill: UpdateBillRequest
  ): Promise<BillResponse> {
    const response = await api.put<BillResponse>(
      `${this.BASE_PATH}/${id}`,
      bill
    );
    return response.data;
  }

  // Delete bill
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
