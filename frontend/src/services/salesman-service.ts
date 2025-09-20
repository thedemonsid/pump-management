import api from './api';
import type { Salesman } from '@/types';

export class SalesmanService {
  private static readonly BASE_PATH = '/api/v1/salesmen';

  // Get all salesmen
  static async getAll(): Promise<Salesman[]> {
    const response = await api.get<Salesman[]>(this.BASE_PATH);
    return response.data;
  }

  // Get salesman by ID
  static async getById(id: string): Promise<Salesman> {
    const response = await api.get<Salesman>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Create new salesman (matches CreateSalesmanRequest DTO)
  static async create(salesman: {
    pumpMasterId: string;
    name: string;
    employeeId: string;
    contactNumber: string;
    email: string;
  }): Promise<Salesman> {
    const response = await api.post<Salesman>(this.BASE_PATH, salesman);
    return response.data;
  }

  // Update existing salesman (matches UpdateSalesmanRequest DTO)
  static async update(
    id: string,
    salesman: {
      name?: string;
      contactNumber?: string;
      email?: string;
      active?: boolean;
    }
  ): Promise<Salesman> {
    const response = await api.put<Salesman>(
      `${this.BASE_PATH}/${id}`,
      salesman
    );
    return response.data;
  }

  // Delete salesman
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
