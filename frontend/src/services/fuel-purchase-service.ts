import api from './api';
import type {
  FuelPurchase,
  CreateFuelPurchase,
  UpdateFuelPurchase,
} from '@/types';

export class FuelPurchaseService {
  private static readonly BASE_PATH = '/api/v1/fuel-purchases';

  // Get all fuel purchases
  static async getAll(): Promise<FuelPurchase[]> {
    const response = await api.get<FuelPurchase[]>(this.BASE_PATH);
    return response.data;
  }

  // Get fuel purchase by ID
  static async getById(id: string): Promise<FuelPurchase> {
    const response = await api.get<FuelPurchase>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get fuel purchases by pump master ID
  static async getByPumpMasterId(
    pumpMasterId: string
  ): Promise<FuelPurchase[]> {
    const response = await api.get<FuelPurchase[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Get fuel purchase by sequential fuel purchase ID within a pump master
  static async getByPumpMasterIdAndFuelPurchaseId(
    pumpMasterId: string,
    fuelPurchaseId: number
  ): Promise<FuelPurchase> {
    const response = await api.get<FuelPurchase>(
      `${this.BASE_PATH}/pump/${pumpMasterId}/fuel-purchase/${fuelPurchaseId}`
    );
    return response.data;
  }

  // Create new fuel purchase
  static async create(fuelPurchase: CreateFuelPurchase): Promise<FuelPurchase> {
    const response = await api.post<FuelPurchase>(this.BASE_PATH, fuelPurchase);
    return response.data;
  }

  // Update existing fuel purchase
  static async update(
    id: string,
    fuelPurchase: UpdateFuelPurchase
  ): Promise<FuelPurchase> {
    const response = await api.put<FuelPurchase>(
      `${this.BASE_PATH}/${id}`,
      fuelPurchase
    );
    return response.data;
  }

  // Delete fuel purchase
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
