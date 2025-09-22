import api from './api';
import type {
  TankTransactionResponse,
  CreateTankTransactionRequest,
} from '@/types';

export class TankTransactionService {
  private static readonly BASE_PATH = '/api/v1/tanks';

  // Get transactions for a tank
  static async getTransactions(
    tankId: string
  ): Promise<TankTransactionResponse[]> {
    const response = await api.get<TankTransactionResponse[]>(
      `${this.BASE_PATH}/${tankId}/transactions`
    );
    return response.data;
  }

  // Get transactions for a tank with date range
  static async getTransactionsWithDateRange(
    tankId: string,
    fromDate: string,
    toDate: string
  ): Promise<TankTransactionResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('fromDate', fromDate);
    queryParams.append('toDate', toDate);

    const response = await api.get<TankTransactionResponse[]>(
      `${this.BASE_PATH}/${tankId}/transactions?${queryParams}`
    );
    return response.data;
  }

  // Create addition transaction (fuel added to tank)
  static async createAddition(
    tankId: string,
    transaction: CreateTankTransactionRequest
  ): Promise<TankTransactionResponse> {
    const response = await api.post<TankTransactionResponse>(
      `${this.BASE_PATH}/${tankId}/addition`,
      transaction
    );
    return response.data;
  }

  // Create removal transaction (fuel removed from tank)
  static async createRemoval(
    tankId: string,
    transaction: CreateTankTransactionRequest
  ): Promise<TankTransactionResponse> {
    const response = await api.post<TankTransactionResponse>(
      `${this.BASE_PATH}/${tankId}/removal`,
      transaction
    );
    return response.data;
  }

  // Get opening level for a specific date
  static async getOpeningLevel(tankId: string, date: string): Promise<number> {
    const queryParams = new URLSearchParams();
    queryParams.append('date', date);

    const response = await api.get<number>(
      `${this.BASE_PATH}/${tankId}/opening-level?${queryParams}`
    );
    return response.data;
  }
}
