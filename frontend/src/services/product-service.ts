import api from './api';
import type { Product } from '@/types';

export class ProductService {
  private static readonly BASE_PATH = '/api/v1/products';

  // Get all products
  static async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>(this.BASE_PATH);
    return response.data;
  }

  // Get product by ID
  static async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Search products by name or other criteria
  static async search(params: {
    name?: string;
    code?: string;
    pumpId?: number;
  }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.code) queryParams.append('code', params.code);
    if (params.pumpId) queryParams.append('pumpId', params.pumpId.toString());

    const response = await api.get<Product[]>(
      `${this.BASE_PATH}/search?${queryParams}`
    );
    return response.data;
  }

  // Get products by pump ID
  static async getByPumpId(pumpId: number): Promise<Product[]> {
    const response = await api.get<Product[]>(
      `${this.BASE_PATH}/pump/${pumpId}`
    );
    return response.data;
  }

  // Create new product
  static async create(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await api.post<Product>(this.BASE_PATH, product);
    return response.data;
  }

  // Update existing product
  static async update(
    id: string,
    product: Omit<Product, 'id'>
  ): Promise<Product> {
    const response = await api.put<Product>(`${this.BASE_PATH}/${id}`, product);
    return response.data;
  }

  // Delete product
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}
