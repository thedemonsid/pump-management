import api from "./api";
import type { CreateNozzleTestRequest, NozzleTestResponse } from "@/types";

export class NozzleTestService {
  private static readonly BASE_PATH = "/api/v1/salesman-shifts";

  /**
   * Register a nozzle test for a shift
   */
  static async createTest(
    shiftId: string,
    payload: CreateNozzleTestRequest
  ): Promise<NozzleTestResponse> {
    const response = await api.post<NozzleTestResponse>(
      `${this.BASE_PATH}/${shiftId}/nozzle-tests`,
      payload
    );
    return response.data;
  }

  /**
   * Get all tests for a shift
   */
  static async getTestsForShift(
    shiftId: string
  ): Promise<NozzleTestResponse[]> {
    const response = await api.get<NozzleTestResponse[]>(
      `${this.BASE_PATH}/${shiftId}/nozzle-tests`
    );
    return response.data;
  }

  /**
   * Get tests for a specific nozzle assignment
   */
  static async getTestsForAssignment(
    shiftId: string,
    assignmentId: string
  ): Promise<NozzleTestResponse[]> {
    const response = await api.get<NozzleTestResponse[]>(
      `${this.BASE_PATH}/${shiftId}/nozzles/${assignmentId}/tests`
    );
    return response.data;
  }

  /**
   * Delete a nozzle test (admin/manager only)
   */
  static async deleteTest(shiftId: string, testId: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${shiftId}/nozzle-tests/${testId}`);
  }
}
