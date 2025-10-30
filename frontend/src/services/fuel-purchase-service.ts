import api from "./api";
import type {
  FuelPurchase,
  CreateFuelPurchase,
  UpdateFuelPurchase,
} from "@/types";

export class FuelPurchaseService {
  private static readonly BASE_PATH = "/api/v1/fuel-purchases";

  // Get all fuel purchases with optional date range filter
  static async getAll(fromDate?: Date, toDate?: Date): Promise<FuelPurchase[]> {
    const params = new URLSearchParams();

    if (fromDate) {
      // Format date as YYYY-MM-DD
      params.append("fromDate", fromDate.toISOString().split("T")[0]);
    }

    if (toDate) {
      // Format date as YYYY-MM-DD
      params.append("toDate", toDate.toISOString().split("T")[0]);
    }

    const url = params.toString()
      ? `${this.BASE_PATH}?${params.toString()}`
      : this.BASE_PATH;
    const response = await api.get<FuelPurchase[]>(url);
    return response.data;
  }

  // Get fuel purchase by ID
  static async getById(id: string): Promise<FuelPurchase> {
    const response = await api.get<FuelPurchase>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get fuel purchase by sequential fuel purchase ID within a pump master
  static async getByPumpMasterIdAndFuelPurchaseId(
    fuelPurchaseId: number
  ): Promise<FuelPurchase> {
    const response = await api.get<FuelPurchase>(
      `${this.BASE_PATH}/fuel-purchase/${fuelPurchaseId}`
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
