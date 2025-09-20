import api from './api';
import type {
  BankAccount,
  CreateBankAccount,
  UpdateBankAccount,
  BankTransaction,
  CreateBankTransaction,
} from '@/types';

export class BankAccountService {
  private static readonly BASE_PATH = '/api/v1/bank-accounts';

  // Get all bank accounts
  static async getAll(): Promise<BankAccount[]> {
    const response = await api.get<BankAccount[]>(this.BASE_PATH);
    return response.data;
  }

  // Get bank account by ID
  static async getById(id: string): Promise<BankAccount> {
    const response = await api.get<BankAccount>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  // Get bank accounts by pump master ID
  static async getByPumpMasterId(pumpMasterId: string): Promise<BankAccount[]> {
    const response = await api.get<BankAccount[]>(
      `${this.BASE_PATH}/pump/${pumpMasterId}`
    );
    return response.data;
  }

  // Search bank accounts with filters
  static async search(params: {
    accountHolderName?: string;
    accountNumber?: string;
    bank?: string;
    pumpMasterId?: string;
  }): Promise<BankAccount[]> {
    const queryParams = new URLSearchParams();
    if (params.accountHolderName)
      queryParams.append('accountHolderName', params.accountHolderName);
    if (params.accountNumber)
      queryParams.append('accountNumber', params.accountNumber);
    if (params.bank) queryParams.append('bank', params.bank);
    if (params.pumpMasterId)
      queryParams.append('pumpMasterId', params.pumpMasterId);

    const response = await api.get<BankAccount[]>(
      `${this.BASE_PATH}/search?${queryParams}`
    );
    return response.data;
  }

  // Create new bank account
  static async create(bankAccount: CreateBankAccount): Promise<BankAccount> {
    const response = await api.post<BankAccount>(this.BASE_PATH, bankAccount);
    return response.data;
  }

  // Update existing bank account
  static async update(
    id: string,
    bankAccount: UpdateBankAccount
  ): Promise<BankAccount> {
    const response = await api.put<BankAccount>(
      `${this.BASE_PATH}/${id}`,
      bankAccount
    );
    return response.data;
  }

  // Delete bank account
  static async delete(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  // Get transactions for a bank account
  static async getTransactions(
    bankAccountId: string
  ): Promise<BankTransaction[]> {
    const response = await api.get<BankTransaction[]>(
      `${this.BASE_PATH}/${bankAccountId}/transactions`
    );
    return response.data;
  }

  // Create credit transaction
  static async credit(
    bankAccountId: string,
    transaction: CreateBankTransaction
  ): Promise<BankTransaction> {
    const response = await api.post<BankTransaction>(
      `${this.BASE_PATH}/${bankAccountId}/credit`,
      transaction
    );
    return response.data;
  }

  // Create debit transaction
  static async debit(
    bankAccountId: string,
    transaction: CreateBankTransaction
  ): Promise<BankTransaction> {
    const response = await api.post<BankTransaction>(
      `${this.BASE_PATH}/${bankAccountId}/debit`,
      transaction
    );
    return response.data;
  }
}
