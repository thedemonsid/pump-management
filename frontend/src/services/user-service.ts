import api from "./api";
import type { User } from "@/types";

export interface ChangePasswordResponse {
  message: string;
}

export interface TokenUserInfo {
  userId: string;
  username: string;
  pumpMasterId: string;
  role: string;
  mobileNumber: string;
  pumpName: string;
  pumpId: number;
  pumpCode: string;
}

export class UserService {
  private static readonly BASE_PATH = "/api/v1/users";

  // Get user by ID
  static async getById(id: string): Promise<User> {
    const response = await api.get<User>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get all users
  static async getAll(): Promise<User[]> {
    const response = await api.get<User[]>(this.BASE_PATH);
    return response.data;
  }

  // Get users by pump master ID
  static async getByPumpMasterId(pumpMasterId: string): Promise<User[]> {
    const response = await api.get<User[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Search users
  static async search(params: {
    username?: string;
    mobileNumber?: string;
    role?: string;
    enabled?: boolean;
    pumpMasterId?: string;
  }): Promise<User[]> {
    const response = await api.get<User[]>(`${this.BASE_PATH}/search`, {
      params,
    });
    return response.data;
  }
}

export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> => {
  const response = await api.post<ChangePasswordResponse>(
    "/api/v1/users/change-password",
    null,
    {
      params: { oldPassword, newPassword },
    }
  );
  return response.data;
};

export const getCurrentUserInfo = async (): Promise<TokenUserInfo> => {
  const response = await api.get<TokenUserInfo>("/api/v1/users/me");
  return response.data;
};
