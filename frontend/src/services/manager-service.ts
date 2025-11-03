import api from "./api";
import type { Manager } from "@/types";

export class ManagerService {
  private static readonly BASE_PATH = "/api/v1/managers";

  // Get all managers
  static async getAll(): Promise<Manager[]> {
    const response = await api.get<Manager[]>(this.BASE_PATH);
    return response.data;
  }

  // Get manager by ID
  static async getById(id: string): Promise<Manager> {
    const response = await api.get<Manager>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Create new manager (matches CreateManagerRequest DTO)
  static async create(manager: {
    username: string;
    password: string;
    mobileNumber: string;
    email?: string;
    aadharNumber?: string;
    panNumber?: string;
    enabled?: boolean;
  }): Promise<Manager> {
    const response = await api.post<Manager>(this.BASE_PATH, manager);
    return response.data;
  }

  // Update existing manager (matches UpdateManagerRequest DTO)
  static async update(
    id: string,
    manager: {
      username?: string;
      password?: string;
      mobileNumber?: string;
      email?: string;
      aadharNumber?: string;
      panNumber?: string;
      enabled?: boolean;
    }
  ): Promise<Manager> {
    const response = await api.put<Manager>(`${this.BASE_PATH}/${id}`, manager);
    return response.data;
  }
}
