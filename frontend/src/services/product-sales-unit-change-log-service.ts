import api from "./api";
import type {
  ProductSalesUnitChangeLog,
  CreateProductSalesUnitChangeLog,
} from "@/types/product-sales-unit-change-log";

const BASE_URL = "/api/product-sales-unit-change-logs";

export const productSalesUnitChangeLogService = {
  // Get all change logs for the current pump master
  getAll: async (): Promise<ProductSalesUnitChangeLog[]> => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  // Get change log by ID
  getById: async (id: string): Promise<ProductSalesUnitChangeLog> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get all change logs for a specific product
  getByProductId: async (
    productId: string
  ): Promise<ProductSalesUnitChangeLog[]> => {
    const response = await api.get(`${BASE_URL}/product/${productId}`);
    return response.data;
  },

  // Get all change logs for a specific product type
  getByProductType: async (
    productType: "FUEL" | "GENERAL"
  ): Promise<ProductSalesUnitChangeLog[]> => {
    const response = await api.get(`${BASE_URL}/product-type/${productType}`);
    return response.data;
  },

  // Get change logs within a date range
  getByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<ProductSalesUnitChangeLog[]> => {
    const response = await api.get(`${BASE_URL}/date-range`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get change logs for a specific product within a date range
  getByProductIdAndDateRange: async (
    productId: string,
    startDate: string,
    endDate: string
  ): Promise<ProductSalesUnitChangeLog[]> => {
    const response = await api.get(
      `${BASE_URL}/product/${productId}/date-range`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },

  // Get all fuel product change logs within a date range
  getFuelProductChangesByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<ProductSalesUnitChangeLog[]> => {
    const response = await api.get(`${BASE_URL}/fuel/date-range`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get the most recent change log for a product
  getMostRecentChangeByProductId: async (
    productId: string
  ): Promise<ProductSalesUnitChangeLog> => {
    const response = await api.get(
      `${BASE_URL}/product/${productId}/most-recent`
    );
    return response.data;
  },

  // Create a new change log entry
  create: async (
    data: CreateProductSalesUnitChangeLog
  ): Promise<ProductSalesUnitChangeLog> => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // Get count of change logs for a product
  getCountByProductId: async (productId: string): Promise<number> => {
    const response = await api.get(`${BASE_URL}/product/${productId}/count`);
    return response.data;
  },

  // Get count of change logs for the current pump master
  getCount: async (): Promise<number> => {
    const response = await api.get(`${BASE_URL}/count`);
    return response.data;
  },
};
