import api from "./api";
import type {
  DipReading,
  CreateDipReading,
  UpdateDipReading,
  PaginatedDipReading,
  DipReadingQueryParams,
} from "@/types/dip-reading";

export class DipReadingService {
  private static readonly BASE_PATH = "/api/v1/dip-readings";

  /**
   * Get dip readings with date range filter (paginated)
   * @param params - Query parameters including startDate, endDate, page, and size
   * @returns Paginated dip readings
   */
  static async getAll(
    params: DipReadingQueryParams
  ): Promise<PaginatedDipReading> {
    const { startDate, endDate, page = 0, size = 20 } = params;
    const response = await api.get<PaginatedDipReading>(this.BASE_PATH, {
      params: {
        startDate,
        endDate,
        page,
        size,
      },
    });
    console.log("Dip Readings Data Received:", JSON.stringify(response.data));
    return response.data;
  }

  /**
   * Get dip readings by tank with date range filter
   * @param tankId - Tank ID
   * @param params - Query parameters including startDate and endDate
   * @returns List of dip readings
   */
  static async getByTankId(
    tankId: string,
    params: { startDate: string; endDate: string }
  ): Promise<DipReading[]> {
    const { startDate, endDate } = params;
    const response = await api.get<DipReading[]>(
      `${this.BASE_PATH}/tank/${tankId}`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );
    return response.data;
  }

  /**
   * Get dip readings by tank with date range filter (paginated)
   * @param tankId - Tank ID
   * @param params - Query parameters including startDate, endDate, page, and size
   * @returns Paginated dip readings
   */
  static async getByTankIdPaginated(
    tankId: string,
    params: DipReadingQueryParams
  ): Promise<PaginatedDipReading> {
    const { startDate, endDate, page = 0, size = 20 } = params;
    const response = await api.get<PaginatedDipReading>(
      `${this.BASE_PATH}/tank/${tankId}/paginated`,
      {
        params: {
          startDate,
          endDate,
          page,
          size,
        },
      }
    );
    return response.data;
  }

  /**
   * Get latest dip reading for a tank
   * @param tankId - Tank ID
   * @returns Latest dip reading
   */
  static async getLatestByTankId(tankId: string): Promise<DipReading> {
    const response = await api.get<DipReading>(
      `${this.BASE_PATH}/tank/${tankId}/latest`
    );
    return response.data;
  }

  /**
   * Get dip reading by ID
   * @param id - Dip reading ID
   * @returns Dip reading details
   */
  static async getById(id: string): Promise<DipReading> {
    const response = await api.get<DipReading>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get dip readings with high variance
   * @param threshold - Variance threshold
   * @returns List of dip readings with high variance
   */
  static async getHighVarianceReadings(
    threshold: number
  ): Promise<DipReading[]> {
    const response = await api.get<DipReading[]>(
      `${this.BASE_PATH}/high-variance`,
      {
        params: {
          threshold,
        },
      }
    );
    return response.data;
  }

  /**
   * Get count of dip readings for a tank
   * @param tankId - Tank ID
   * @returns Count of dip readings
   */
  static async getCountByTankId(tankId: string): Promise<number> {
    const response = await api.get<number>(
      `${this.BASE_PATH}/tank/${tankId}/count`
    );
    return response.data;
  }

  /**
   * Create new dip reading
   * @param dipReading - Dip reading data
   * @returns Created dip reading
   */
  static async create(dipReading: CreateDipReading): Promise<DipReading> {
    // Format date to local YYYY-MM-DD format (not UTC) to prevent timezone shifting
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      ...dipReading,
      readingDate: dipReading.readingDate
        ? formatLocalDate(dipReading.readingDate)
        : undefined,
    };
    const response = await api.post<DipReading>(this.BASE_PATH, payload);
    return response.data;
  }

  /**
   * Update existing dip reading
   * @param id - Dip reading ID
   * @param dipReading - Updated dip reading data
   * @returns Updated dip reading
   */
  static async update(
    id: string,
    dipReading: UpdateDipReading
  ): Promise<DipReading> {
    // Format date to local YYYY-MM-DD format (not UTC) to prevent timezone shifting
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      ...dipReading,
      readingDate: dipReading.readingDate
        ? formatLocalDate(dipReading.readingDate)
        : undefined,
    };
    const response = await api.put<DipReading>(
      `${this.BASE_PATH}/${id}`,
      payload
    );
    return response.data;
  }

  /**
   * Delete dip reading
   * @param id - Dip reading ID
   * @returns void
   */
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
