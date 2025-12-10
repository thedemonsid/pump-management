import api from "./api";
import type {
  CreateSalesmanBillRequest,
  UpdateSalesmanBillRequest,
  SalesmanBillResponse,
} from "@/types";

export class SalesmanBillService {
  private static readonly BASE_PATH = "/api/v1/salesman-bills";

  // Get all salesman bills
  static async getAll(): Promise<SalesmanBillResponse[]> {
    const response = await api.get<SalesmanBillResponse[]>(this.BASE_PATH);
    return response.data;
  }

  // Get salesman bill by ID
  static async getById(id: string): Promise<SalesmanBillResponse> {
    const response = await api.get<SalesmanBillResponse>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  // Get bills by salesman shift ID
  static async getByShift(
    salesmanShiftId: string
  ): Promise<SalesmanBillResponse[]> {
    const response = await api.get<SalesmanBillResponse[]>(
      `${this.BASE_PATH}/shift/${salesmanShiftId}`
    );
    return response.data;
  }

  // Get bills by pump master ID (from request attributes)
  static async getByPumpMaster(): Promise<SalesmanBillResponse[]> {
    const response = await api.get<SalesmanBillResponse[]>(this.BASE_PATH);
    return response.data;
  }

  // Get bills by date range
  static async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<SalesmanBillResponse[]> {
    const response = await api.get<SalesmanBillResponse[]>(
      `${this.BASE_PATH}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  // Get bills by customer ID
  static async getByCustomer(
    customerId: string,
    limit?: number
  ): Promise<SalesmanBillResponse[]> {
    const url = limit
      ? `${this.BASE_PATH}/customer/${customerId}?limit=${limit}`
      : `${this.BASE_PATH}/customer/${customerId}`;
    const response = await api.get<SalesmanBillResponse[]>(url);
    return response.data;
  }

  // Get next bill number for pump master
  static async getNextBillNo(): Promise<number> {
    const response = await api.get<number>(`${this.BASE_PATH}/next-bill-no`);
    return response.data;
  }

  // Create new salesman bill with images
  static async create(
    bill: CreateSalesmanBillRequest,
    images?: {
      meterImage?: File;
      vehicleImage?: File;
      extraImage?: File;
    }
  ): Promise<SalesmanBillResponse> {
    const formData = new FormData();

    // Append bill data as JSON blob
    formData.append(
      "data",
      new Blob([JSON.stringify(bill)], { type: "application/json" })
    );

    // Append images if provided
    if (images?.meterImage) {
      formData.append("meterImage", images.meterImage);
    }
    if (images?.vehicleImage) {
      formData.append("vehicleImage", images.vehicleImage);
    }
    if (images?.extraImage) {
      formData.append("extraImage", images.extraImage);
    }

    const response = await api.post<SalesmanBillResponse>(
      this.BASE_PATH,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Update existing salesman bill
  static async update(
    id: string,
    bill: UpdateSalesmanBillRequest
  ): Promise<SalesmanBillResponse> {
    const response = await api.put<SalesmanBillResponse>(
      `${this.BASE_PATH}/${id}`,
      bill
    );
    return response.data;
  }

  // Delete salesman bill
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
