import api from './api';
import type { Nozzle, CreateNozzle, UpdateNozzle } from '@/types';

export class NozzleService {
  private static readonly BASE_PATH = '/api/v1/nozzles';

  // Get all nozzles
  static async getAllForPump(): Promise<Nozzle[]> {
    const response = await api.get<Nozzle[]>(this.BASE_PATH);
    return response.data;
  }

  // Get nozzle by ID
  static async getById(id: string): Promise<Nozzle> {
    const response = await api.get<Nozzle>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Create new nozzle
  static async create(nozzle: CreateNozzle): Promise<Nozzle> {
    const response = await api.post<Nozzle>(this.BASE_PATH, nozzle);
    return response.data;
  }

  // Update existing nozzle
  static async update(id: string, nozzle: UpdateNozzle): Promise<Nozzle> {
    const response = await api.put<Nozzle>(`${this.BASE_PATH}/${id}`, nozzle);
    return response.data;
  }

  // Delete nozzle
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
