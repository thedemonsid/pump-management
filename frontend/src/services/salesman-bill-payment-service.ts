import api from "./api";
import type {
  CreateSalesmanBillPaymentRequest,
  UpdateSalesmanBillPaymentRequest,
  SalesmanBillPaymentResponse,
} from "@/types";

export class SalesmanBillPaymentService {
  private static readonly BASE_PATH = "/api/v1/salesman-bill-payments";

  // Get all salesman bill payments
  static async getAll(): Promise<SalesmanBillPaymentResponse[]> {
    const response = await api.get<SalesmanBillPaymentResponse[]>(
      this.BASE_PATH
    );
    return response.data;
  }

  // Get payment by ID
  static async getById(id: string): Promise<SalesmanBillPaymentResponse> {
    const response = await api.get<SalesmanBillPaymentResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get payments by salesman bill ID
  static async getByBillId(
    salesmanBillId: string
  ): Promise<SalesmanBillPaymentResponse[]> {
    const response = await api.get<SalesmanBillPaymentResponse[]>(
      `${this.BASE_PATH}/bill/${salesmanBillId}`
    );
    return response.data;
  }

  // Get payments by shift ID
  static async getByShiftId(
    salesmanShiftId: string
  ): Promise<SalesmanBillPaymentResponse[]> {
    const response = await api.get<SalesmanBillPaymentResponse[]>(
      `${this.BASE_PATH}/shift/${salesmanShiftId}`
    );
    return response.data;
  }

  // Get payments by customer ID
  static async getByCustomerId(
    customerId: string,
    pumpMasterId?: string,
    limit?: number
  ): Promise<SalesmanBillPaymentResponse[]> {
    const params = new URLSearchParams();
    if (pumpMasterId) params.append("pumpMasterId", pumpMasterId);
    if (limit) params.append("limit", limit.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${this.BASE_PATH}/customer/${customerId}?${queryString}`
      : `${this.BASE_PATH}/customer/${customerId}`;
    const response = await api.get<SalesmanBillPaymentResponse[]>(url);
    return response.data;
  }

  // Get payments by date range
  static async getByDateRange(
    fromDate: string,
    toDate: string
  ): Promise<SalesmanBillPaymentResponse[]> {
    const response = await api.get<SalesmanBillPaymentResponse[]>(
      `${this.BASE_PATH}/date-range?fromDate=${fromDate}&toDate=${toDate}`
    );
    return response.data;
  }

  // Get total payments for a bill
  static async getTotalByBillId(salesmanBillId: string): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/bill/${salesmanBillId}/total`
    );
    return response.data;
  }

  // Get total payments for a shift
  static async getTotalByShiftId(salesmanShiftId: string): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/shift/${salesmanShiftId}/total`
    );
    return response.data;
  }

  // Create new salesman bill payment
  static async create(
    payment: CreateSalesmanBillPaymentRequest
  ): Promise<SalesmanBillPaymentResponse> {
    const response = await api.post<SalesmanBillPaymentResponse>(
      this.BASE_PATH,
      payment
    );
    return response.data;
  }

  // Update existing salesman bill payment
  static async update(
    id: string,
    payment: UpdateSalesmanBillPaymentRequest
  ): Promise<SalesmanBillPaymentResponse> {
    const response = await api.put<SalesmanBillPaymentResponse>(
      `${this.BASE_PATH}/${id}`,
      payment
    );
    return response.data;
  }

  // Delete salesman bill payment
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
