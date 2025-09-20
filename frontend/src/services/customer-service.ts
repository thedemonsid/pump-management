import api from './api';
import type { Customer, CreateCustomer, UpdateCustomer } from '@/types';

export class CustomerService {
  private static readonly BASE_PATH = '/api/v1/customers';

  // Get all customers
  static async getAll(): Promise<Customer[]> {
    const response = await api.get<Customer[]>(this.BASE_PATH);
    return response.data;
  }

  // Get customer by ID
  static async getById(id: string): Promise<Customer> {
    const response = await api.get<Customer>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Search customers by name
  static async search(params: { customerName?: string }): Promise<Customer[]> {
    const queryParams = new URLSearchParams();
    if (params.customerName)
      queryParams.append('customerName', params.customerName);

    const response = await api.get<Customer[]>(
      `${this.BASE_PATH}/search?${queryParams}`
    );
    return response.data;
  }

  // Get customers by pump master ID
  static async getByPumpMasterId(pumpMasterId: string): Promise<Customer[]> {
    const response = await api.get<Customer[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Check if customer exists by name and pump master
  static async existsByCustomerNameAndPumpMasterId(params: {
    customerName: string;
    pumpMasterId: string;
  }): Promise<boolean> {
    const queryParams = new URLSearchParams();
    queryParams.append('customerName', params.customerName);
    queryParams.append('pumpMasterId', params.pumpMasterId);

    const response = await api.get<{ exists: boolean }>(
      `${this.BASE_PATH}/exists?${queryParams}`
    );
    return response.data.exists;
  }

  // Create new customer
  static async create(customer: CreateCustomer): Promise<Customer> {
    const response = await api.post<Customer>(this.BASE_PATH, customer);
    return response.data;
  }

  // Update existing customer
  static async update(id: string, customer: UpdateCustomer): Promise<Customer> {
    const response = await api.put<Customer>(
      `${this.BASE_PATH}/${id}`,
      customer
    );
    return response.data;
  }

  // Delete customer
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
