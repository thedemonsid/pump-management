import api from './api';
import type {
  NozzleShiftResponse,
  CreateNozzleShiftRequest,
  UpdateNozzleShiftRequest,
} from '@/types';

export class NozzleShiftService {
  private static readonly BASE_PATH = '/api/v1/nozzle-shifts';

  // Get nozzle shift by ID
  static async getById(id: string): Promise<NozzleShiftResponse> {
    const response = await api.get<NozzleShiftResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get shifts by nozzle ID
  static async getByNozzleId(nozzleId: string): Promise<NozzleShiftResponse[]> {
    const response = await api.get<NozzleShiftResponse[]>(
      `${this.BASE_PATH}/nozzle/${nozzleId}`
    );
    return response.data;
  }

  // Get shifts by salesman ID
  static async getBySalesmanId(
    salesmanId: string
  ): Promise<NozzleShiftResponse[]> {
    const response = await api.get<NozzleShiftResponse[]>(
      `${this.BASE_PATH}/salesman/${salesmanId}`
    );
    return response.data;
  }

  // Get shifts by date
  static async getByShiftDate(date: string): Promise<NozzleShiftResponse[]> {
    const response = await api.get<NozzleShiftResponse[]>(
      `${this.BASE_PATH}/date?date=${date}`
    );
    return response.data;
  }

  // Get open shifts
  static async getOpenShifts(): Promise<NozzleShiftResponse[]> {
    const response = await api.get<NozzleShiftResponse[]>(
      `${this.BASE_PATH}/open`
    );
    return response.data;
  }

  // Create a new nozzle shift
  static async create(
    request: CreateNozzleShiftRequest
  ): Promise<NozzleShiftResponse> {
    const response = await api.post<NozzleShiftResponse>(
      this.BASE_PATH,
      request
    );
    return response.data;
  }

  // Update a nozzle shift
  static async update(
    id: string,
    request: UpdateNozzleShiftRequest
  ): Promise<NozzleShiftResponse> {
    const response = await api.put<NozzleShiftResponse>(
      `${this.BASE_PATH}/${id}`,
      request
    );
    return response.data;
  }

  // Delete a nozzle shift
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
