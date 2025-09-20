import api from './api';
import type {
  SupplierPaymentResponse,
  CreateSupplierPaymentRequest,
  UpdateSupplierPaymentRequest,
} from '@/types';

// Pagination interfaces
interface Pageable {
  page?: number;
  size?: number;
  sort?: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export class SupplierPaymentService {
  private static readonly BASE_PATH = '/api/supplier-payments';

  // Get all supplier payments
  static async getAll(): Promise<SupplierPaymentResponse[]> {
    const response = await api.get<SupplierPaymentResponse[]>(this.BASE_PATH);
    return response.data;
  }

  // Get all supplier payments with pagination
  static async getAllPaginated(
    pageable: Pageable
  ): Promise<Page<SupplierPaymentResponse>> {
    const queryParams = new URLSearchParams();
    if (pageable.page !== undefined)
      queryParams.append('page', pageable.page.toString());
    if (pageable.size !== undefined)
      queryParams.append('size', pageable.size.toString());
    if (pageable.sort) queryParams.append('sort', pageable.sort);

    const response = await api.get<Page<SupplierPaymentResponse>>(
      `${this.BASE_PATH}/paginated?${queryParams}`
    );
    return response.data;
  }

  // Get supplier payment by ID
  static async getById(id: string): Promise<SupplierPaymentResponse> {
    const response = await api.get<SupplierPaymentResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get supplier payments by pump master ID
  static async getByPumpMasterId(
    pumpMasterId: string
  ): Promise<SupplierPaymentResponse[]> {
    const response = await api.get<SupplierPaymentResponse[]>(
      `${this.BASE_PATH}/pump-master/${pumpMasterId}`
    );
    return response.data;
  }

  // Get supplier payments by purchase ID
  static async getByPurchaseId(
    purchaseId: string
  ): Promise<SupplierPaymentResponse[]> {
    const response = await api.get<SupplierPaymentResponse[]>(
      `${this.BASE_PATH}/purchase/${purchaseId}`
    );
    return response.data;
  }

  // Get supplier payments by fuel purchase ID
  static async getByFuelPurchaseId(
    fuelPurchaseId: string
  ): Promise<SupplierPaymentResponse[]> {
    const response = await api.get<SupplierPaymentResponse[]>(
      `${this.BASE_PATH}/fuel-purchase/${fuelPurchaseId}`
    );
    return response.data;
  }

  // Get general supplier payments by pump master ID
  static async getGeneralPaymentsByPumpMasterId(
    pumpMasterId: string
  ): Promise<SupplierPaymentResponse[]> {
    const response = await api.get<SupplierPaymentResponse[]>(
      `${this.BASE_PATH}/general/pump-master/${pumpMasterId}`
    );
    return response.data;
  }

  // Create new supplier payment
  static async create(
    payment: CreateSupplierPaymentRequest
  ): Promise<SupplierPaymentResponse> {
    const response = await api.post<SupplierPaymentResponse>(
      this.BASE_PATH,
      payment
    );
    return response.data;
  }

  // Update existing supplier payment
  static async update(
    id: string,
    payment: UpdateSupplierPaymentRequest
  ): Promise<SupplierPaymentResponse> {
    const response = await api.put<SupplierPaymentResponse>(
      `${this.BASE_PATH}/${id}`,
      payment
    );
    return response.data;
  }

  // Delete supplier payment
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
