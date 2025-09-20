import api from './api';
import type { Tank, CreateTank, UpdateTank } from '@/types';

export class TankService {
  private static readonly BASE_PATH = '/api/v1/tanks';

  // Get all tanks
  static async getAll(): Promise<Tank[]> {
    const response = await api.get<Tank[]>(this.BASE_PATH);
    console.log('Tanks Data Received :' + JSON.stringify(response.data));
    return response.data;
  }

  // Get tank by ID
  static async getById(id: string): Promise<Tank> {
    const response = await api.get<Tank>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Create new tank
  static async create(tank: CreateTank): Promise<Tank> {
    const response = await api.post<Tank>(this.BASE_PATH, tank);
    return response.data;
  }

  // Update existing tank - Note: API docs don't show PUT endpoint for tanks
  static async update(id: string, tank: UpdateTank): Promise<Tank> {
    const response = await api.put<Tank>(`${this.BASE_PATH}/${id}`, tank);
    return response.data;
  }

  // Delete tank
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
