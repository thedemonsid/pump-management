import api from "./api";
import type {
  AddNozzleRequest,
  CloseNozzleRequest,
  NozzleAssignmentResponse,
} from "@/types";

export class NozzleAssignmentService {
  // Base path for operations scoped under a salesman shift
  private static readonly BASE_SHIFT_PATH = "/api/v1/salesman-shifts";

  static async addNozzleToShift(
    shiftId: string,
    payload: AddNozzleRequest
  ): Promise<NozzleAssignmentResponse> {
    const response = await api.post<NozzleAssignmentResponse>(
      `${this.BASE_SHIFT_PATH}/${shiftId}/nozzles`,
      payload
    );
    return response.data;
  }

  static async closeNozzleAssignment(
    shiftId: string,
    assignmentId: string,
    payload: CloseNozzleRequest
  ): Promise<NozzleAssignmentResponse> {
    const response = await api.put<NozzleAssignmentResponse>(
      `${this.BASE_SHIFT_PATH}/${shiftId}/nozzles/${assignmentId}/close`,
      payload
    );
    return response.data;
  }

  static async getAssignmentsForShift(
    shiftId: string
  ): Promise<NozzleAssignmentResponse[]> {
    const response = await api.get<NozzleAssignmentResponse[]>(
      `${this.BASE_SHIFT_PATH}/${shiftId}/nozzles`
    );
    return response.data;
  }

  // Convenience: get assignments for a nozzle across shifts (if backend exposes)
  static async getByNozzleId(
    nozzleId: string
  ): Promise<NozzleAssignmentResponse[]> {
    const response = await api.get<NozzleAssignmentResponse[]>(
      `${this.BASE_SHIFT_PATH}/nozzle/${nozzleId}`
    );
    return response.data;
  }
}
