import api from './api';
import type { Shift } from '@/types';

export class ShiftService {
  private static readonly BASE_PATH = '/api/v1/shifts';

  // Get all shifts
  static async getAll(): Promise<Shift[]> {
    const response = await api.get<Shift[]>(this.BASE_PATH);
    return response.data;
  }

  // Get shift by ID
  static async getById(id: string): Promise<Shift> {
    const response = await api.get<Shift>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Create new shift (matches CreateShiftRequest DTO)
  static async create(shift: {
    pumpMasterId: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
  }): Promise<Shift> {
    const response = await api.post<Shift>(this.BASE_PATH, shift);
    return response.data;
  }

  // Update existing shift (matches UpdateShiftRequest DTO)
  static async update(
    id: string,
    shift: {
      name?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      isActive?: boolean;
    }
  ): Promise<Shift> {
    const response = await api.put<Shift>(`${this.BASE_PATH}/${id}`, shift);
    return response.data;
  }

  // Delete shift
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
