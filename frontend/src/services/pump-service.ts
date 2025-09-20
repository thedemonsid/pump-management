import api from './api';
import type { PumpInfoMaster } from '@/types';

export class PumpService {
  private static readonly BASE_PATH = '/api/v1/pumps';

  // Get all pumps
  static async getAll(): Promise<PumpInfoMaster[]> {
    const response = await api.get<PumpInfoMaster[]>(this.BASE_PATH);
    return response.data;
  }

  // Get pump by ID
  static async getById(id: string): Promise<PumpInfoMaster> {
    const response = await api.get<PumpInfoMaster>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get pump by code
  static async getByCode(pumpCode: string): Promise<PumpInfoMaster> {
    const response = await api.get<PumpInfoMaster>(
      `${this.BASE_PATH}/code/${pumpCode}`
    );
    return response.data;
  }

  // Search pumps by name and/or code
  static async search(params: {
    name?: string;
    code?: string;
  }): Promise<PumpInfoMaster[]> {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.code) queryParams.append('code', params.code);

    const response = await api.get<PumpInfoMaster[]>(
      `${this.BASE_PATH}/search?${queryParams}`
    );
    return response.data;
  }

  // Check if pump code exists
  static async checkCodeExists(pumpCode: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(
      `${this.BASE_PATH}/exists/code/${pumpCode}`
    );
    return response.data.exists;
  }

  // Get total pump count
  static async getTotalCount(): Promise<number> {
    const response = await api.get<{ count: number }>(
      `${this.BASE_PATH}/count`
    );
    return response.data.count;
  }

  // Create new pump
  static async create(
    pump: Omit<PumpInfoMaster, 'id'>
  ): Promise<PumpInfoMaster> {
    const response = await api.post<PumpInfoMaster>(this.BASE_PATH, pump);
    return response.data;
  }

  // Update existing pump
  static async update(
    id: string,
    pump: Omit<PumpInfoMaster, 'id'>
  ): Promise<PumpInfoMaster> {
    const response = await api.put<PumpInfoMaster>(
      `${this.BASE_PATH}/${id}`,
      pump
    );
    return response.data;
  }

  // Delete pump
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
