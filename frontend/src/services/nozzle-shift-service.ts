import api from './api';
import type {
  NozzleShiftResponse,
  CreateNozzleShiftRequest,
  UpdateNozzleShiftRequest,
} from '@/types';

export class NozzleShiftService {
  private static readonly BASE_PATH = '/api/v1/nozzle-shifts';

  static async getAll(params?: {
    fromDate?: string;
    toDate?: string;
    nozzleId?: string;
    salesmanId?: string;
  }): Promise<NozzleShiftResponse[]> {
    const searchParams = new URLSearchParams();

    if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
    if (params?.toDate) searchParams.append('toDate', params.toDate);
    if (params?.nozzleId) searchParams.append('nozzleId', params.nozzleId);
    if (params?.salesmanId)
      searchParams.append('salesmanId', params.salesmanId);

    const url = searchParams.toString()
      ? `${this.BASE_PATH}?${searchParams.toString()}`
      : this.BASE_PATH;

    const response = await api.get<NozzleShiftResponse[]>(url);
    return response.data;
  }

  static async getById(id: string): Promise<NozzleShiftResponse> {
    const response = await api.get<NozzleShiftResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  static async create(
    shift: CreateNozzleShiftRequest
  ): Promise<NozzleShiftResponse> {
    const response = await api.post<NozzleShiftResponse>(this.BASE_PATH, shift);
    return response.data;
  }

  static async update(
    id: string,
    shift: UpdateNozzleShiftRequest
  ): Promise<NozzleShiftResponse> {
    const response = await api.put<NozzleShiftResponse>(
      `${this.BASE_PATH}/${id}`,
      shift
    );
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  static async getActiveShifts(
    nozzleId?: string
  ): Promise<NozzleShiftResponse[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('active', 'true');
    if (nozzleId) searchParams.append('nozzleId', nozzleId);

    const response = await api.get<NozzleShiftResponse[]>(
      `${this.BASE_PATH}?${searchParams.toString()}`
    );
    return response.data;
  }
}
