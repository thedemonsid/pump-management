import api from "./api";
import type {
  CreateBillRequest,
  UpdateBillRequest,
  BillResponse,
  BillItemResponse,
  CreateBillItemRequest,
} from "@/types";

export class BillService {
  private static readonly BASE_PATH = "/api/v1/bills";

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
  static async getByPumpMasterId(): Promise<BillResponse[]> {
    const response = await api.get<BillResponse[]>(this.BASE_PATH);
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
  static async getByCustomerId(
    customerId: string,
    limit?: number
  ): Promise<BillResponse[]> {
    const url = limit
      ? `${this.BASE_PATH}/customer/${customerId}?limit=${limit}`
      : `${this.BASE_PATH}/customer/${customerId}`;
    const response = await api.get<BillResponse[]>(url);
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

  // Delete bill item
  static async deleteBillItem(billItemId: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/items/${billItemId}`);
  }

  // Create bill item
  static async createBillItem(
    billId: string,
    billItem: CreateBillItemRequest
  ): Promise<BillItemResponse> {
    const response = await api.post<BillItemResponse>(
      `${this.BASE_PATH}/${billId}/items`,
      billItem
    );
    return response.data;
  }

  // Update bill item
  static async updateBillItem(
    billItemId: string,
    billItem: CreateBillItemRequest
  ): Promise<BillItemResponse> {
    const response = await api.put<BillItemResponse>(
      `${this.BASE_PATH}/items/${billItemId}`,
      billItem
    );
    return response.data;
  }
}
