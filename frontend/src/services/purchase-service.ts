import api from "./api";
import type { Purchase, CreatePurchase, UpdatePurchase } from "@/types";

export class PurchaseService {
  private static readonly BASE_PATH = "/api/v1/purchases";

  // Get all purchases with optional date filtering
  static async getAll(fromDate?: Date, toDate?: Date): Promise<Purchase[]> {
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
    const response = await api.get<Purchase[]>(url);
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

  // Get purchases by supplier ID with optional limit
  static async getBySupplierId(
    supplierId: string,
    limit?: number
  ): Promise<Purchase[]> {
    const queryParams = limit ? `?limit=${limit}` : "";
    const response = await api.get<Purchase[]>(
      `${this.BASE_PATH}/supplier/${supplierId}${queryParams}`
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
