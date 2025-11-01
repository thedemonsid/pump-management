import api from "./api";
import type { Purchase, CreatePurchase, UpdatePurchase } from "@/types";

export class PurchaseService {
  private static readonly BASE_PATH = "/api/v1/purchases";

  // Get all purchases
  static async getAll(): Promise<Purchase[]> {
    const response = await api.get<Purchase[]>(this.BASE_PATH);
    return response.data;
  }

  // Get purchase by ID
  static async getById(id: string): Promise<Purchase> {
    const response = await api.get<Purchase>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get purchases by pump master ID
  static async getByPumpMasterId(pumpMasterId: string): Promise<Purchase[]> {
    const response = await api.get<Purchase[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Get purchase by sequential purchase ID within a pump master
  static async getByPumpMasterIdAndPurchaseId(
    pumpMasterId: string,
    purchaseId: number
  ): Promise<Purchase> {
    const response = await api.get<Purchase>(
      `${this.BASE_PATH}/pump/${pumpMasterId}/purchase/${purchaseId}`
    );
    return response.data;
  }

  // Create new purchase
  static async create(purchase: CreatePurchase): Promise<Purchase> {
    const response = await api.post<Purchase>(this.BASE_PATH, purchase);
    return response.data;
  }

  // Update existing purchase
  static async update(id: string, purchase: UpdatePurchase): Promise<Purchase> {
    const response = await api.put<Purchase>(
      `${this.BASE_PATH}/${id}`,
      purchase
    );
    return response.data;
  }

  // Delete purchase
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  // Get next purchase ID
  static async getNextPurchaseId(): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/next-purchase-id`
    );
    return response.data;
  }
}
