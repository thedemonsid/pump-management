import api from "./api";
import type { UserAbsence } from "@/types";

export class UserAbsenceService {
  private static readonly BASE_PATH = "/api/v1/user-absences";

  // Get all user absences
  static async getAll(): Promise<UserAbsence[]> {
    const response = await api.get<UserAbsence[]>(this.BASE_PATH);
    return response.data;
  }

  // Get user absence by ID
  static async getById(id: string): Promise<UserAbsence> {
    const response = await api.get<UserAbsence>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get absences by user ID
  static async getByUserId(userId: string): Promise<UserAbsence[]> {
    const response = await api.get<UserAbsence[]>(
      `${this.BASE_PATH}/user/${userId}`
    );
    return response.data;
  }

  // Get absences by date range
  static async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<UserAbsence[]> {
    const response = await api.get<UserAbsence[]>(
      `${this.BASE_PATH}/date-range`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  }

  // Get absences by approval status
  static async getByApprovalStatus(
    isApproved: boolean
  ): Promise<UserAbsence[]> {
    const response = await api.get<UserAbsence[]>(
      `${this.BASE_PATH}/approval-status`,
      {
        params: { isApproved },
      }
    );
    return response.data;
  }

  // Create new user absence
  static async create(absence: {
    userId: string;
    absenceDate: string;
    reason?: string;
    notes?: string;
    isApproved?: boolean;
  }): Promise<UserAbsence> {
    const response = await api.post<UserAbsence>(this.BASE_PATH, absence);
    return response.data;
  }

  // Update existing user absence
  static async update(
    id: string,
    absence: {
      absenceDate?: string;
      reason?: string;
      notes?: string;
      isApproved?: boolean;
    }
  ): Promise<UserAbsence> {
    const response = await api.put<UserAbsence>(
      `${this.BASE_PATH}/${id}`,
      absence
    );
    return response.data;
  }

  // Delete user absence
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
