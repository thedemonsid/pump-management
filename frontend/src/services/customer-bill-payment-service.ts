import api from './api';
import type {
  CreateCustomerBillPaymentRequest,
  UpdateCustomerBillPaymentRequest,
  CustomerBillPaymentResponse,
} from '@/types';

export class CustomerBillPaymentService {
  private static readonly BASE_PATH = '/api/v1/customer-bill-payments';

  // Get all customer bill payments
  static async getAll(): Promise<CustomerBillPaymentResponse[]> {
    const response = await api.get<CustomerBillPaymentResponse[]>(
      this.BASE_PATH
    );
    return response.data;
  }

  // Get payment by ID
  static async getById(id: string): Promise<CustomerBillPaymentResponse> {
    const response = await api.get<CustomerBillPaymentResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get payments by pump master ID
  static async getByPumpMasterId(
    pumpMasterId: string
  ): Promise<CustomerBillPaymentResponse[]> {
    const response = await api.get<CustomerBillPaymentResponse[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Get payments by customer ID
  static async getByCustomerId(
    customerId: string,
    pumpMasterId?: string
  ): Promise<CustomerBillPaymentResponse[]> {
    const url = pumpMasterId
      ? `${this.BASE_PATH}/customer/${customerId}?pumpMasterId=${pumpMasterId}`
      : `${this.BASE_PATH}/customer/${customerId}`;
    const response = await api.get<CustomerBillPaymentResponse[]>(url);
    return response.data;
  }

  // Get payments by bill ID
  static async getByBillId(
    billId: string
  ): Promise<CustomerBillPaymentResponse[]> {
    const response = await api.get<CustomerBillPaymentResponse[]>(
      `${this.BASE_PATH}/bill/${billId}`
    );
    return response.data;
  }

  // Create new payment
  static async create(
    payment: CreateCustomerBillPaymentRequest
  ): Promise<CustomerBillPaymentResponse> {
    const response = await api.post<CustomerBillPaymentResponse>(
      `${this.BASE_PATH}`,
      payment
    );
    return response.data;
  }

  // Update existing payment
  static async update(
    id: string,
    payment: UpdateCustomerBillPaymentRequest
  ): Promise<CustomerBillPaymentResponse> {
    const response = await api.put<CustomerBillPaymentResponse>(
      `${this.BASE_PATH}/${id}`,
      payment
    );
    return response.data;
  }

  // Delete payment
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
