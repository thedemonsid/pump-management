import api from './api';
import type { Supplier, CreateSupplier, UpdateSupplier } from '@/types';

export class SupplierService {
  private static readonly BASE_PATH = '/api/v1/suppliers';

  // Get all suppliers
  static async getAll(): Promise<Supplier[]> {
    const response = await api.get<Supplier[]>(this.BASE_PATH);
    return response.data;
  }

  // Get supplier by ID
  static async getById(id: string): Promise<Supplier> {
    const response = await api.get<Supplier>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Search suppliers by name
  static async search(params: { supplierName?: string }): Promise<Supplier[]> {
    const queryParams = new URLSearchParams();
    if (params.supplierName)
      queryParams.append('supplierName', params.supplierName);

    const response = await api.get<Supplier[]>(
      `${this.BASE_PATH}/search?${queryParams}`
    );
    return response.data;
  }

  // Get suppliers by pump master ID
  static async getByPumpMasterId(pumpMasterId: string): Promise<Supplier[]> {
    const response = await api.get<Supplier[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Check if supplier exists by name and pump master
  static async existsBySupplierNameAndPumpMasterId(params: {
    supplierName: string;
    pumpMasterId: string;
  }): Promise<boolean> {
    const queryParams = new URLSearchParams();
    queryParams.append('supplierName', params.supplierName);
    queryParams.append('pumpMasterId', params.pumpMasterId);

    const response = await api.get<{ exists: boolean }>(
      `${this.BASE_PATH}/exists?${queryParams}`
    );
    return response.data.exists;
  }

  // Create new supplier
  static async create(supplier: CreateSupplier): Promise<Supplier> {
    const response = await api.post<Supplier>(this.BASE_PATH, supplier);
    return response.data;
  }

  // Update existing supplier
  static async update(id: string, supplier: UpdateSupplier): Promise<Supplier> {
    const response = await api.put<Supplier>(
      `${this.BASE_PATH}/${id}`,
      supplier
    );
    return response.data;
  }

  // Delete supplier
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
