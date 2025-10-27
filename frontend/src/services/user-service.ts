import api from "./api";

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
