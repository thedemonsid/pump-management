import { z } from 'zod';

/**
 * Tank transaction types
 */
export type TankTransactionType = 'ADDITION' | 'REMOVAL';

/**
 * Tank transaction entity
 */
export interface TankTransactionEntity {
  id?: string;
  tankId: string;
  volume: number;
  transactionType: TankTransactionType;
  description: string;
  transactionDate: string;
  supplierName?: string;
  invoiceNumber?: string;
  entryBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create tank transaction request
 */
export interface CreateTankTransactionRequest {
  volume: number;
  transactionType: TankTransactionType;
  description: string;
  transactionDate: string;
  supplierName?: string;
  invoiceNumber?: string;
}

/**
 * Tank transaction response
 */
export interface TankTransactionResponse extends TankTransactionEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ledger entry representing a transaction in the tank's ledger
 */
export interface TankLedgerEntry {
  date: string;
  action: string;
  volume: number;
  type: 'addition' | 'removal';
  level: number; // Running level after this transaction
  description: string;
  supplierName?: string;
  invoiceNumber?: string;
  entryBy: string;
  transactionDetails: TankTransactionEntity;
}

/**
 * Summary information for tank ledger calculations
 */
export interface TankLedgerSummary {
  openingLevel: number;
  totalAdditionsBefore: number;
  totalRemovalsBefore: number;
  levelBefore: number;
  totalAdditionsInRange: number;
  totalRemovalsInRange: number;
  closingLevel: number;
  totalAdditionsTillDate: number;
  totalRemovalsTillDate: number;
}

/**
 * Parameters for computing tank ledger data
 */
export interface ComputeTankLedgerParams {
  tankId: string;
  fromDate: string;
  toDate: string;
  openingLevel: number;
}

/**
 * State for tank ledger store
 */
export interface TankLedgerState {
  ledgerData: TankLedgerEntry[];
  summary: TankLedgerSummary;
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
}

/**
 * Zod schemas for validation
 */
export const CreateTankTransactionSchema = z.object({
  volume: z.number().positive('Volume must be positive'),
  transactionType: z.enum(['ADDITION', 'REMOVAL']),
  description: z.string().min(1, 'Description is required'),
  transactionDate: z.string(),
  supplierName: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

export const TankTransactionSchema = z.object({
  id: z.string().optional(),
  tankId: z.string(),
  volume: z.number().positive(),
  transactionType: z.enum(['ADDITION', 'REMOVAL']),
  description: z.string(),
  transactionDate: z.string(),
  supplierName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  entryBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CreateTankTransaction = z.infer<typeof CreateTankTransactionSchema>;
export type TankTransaction = z.infer<typeof TankTransactionSchema>;
