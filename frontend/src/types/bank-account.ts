import { z } from 'zod';
import { TransactionTypeSchema, PaymentMethodSchema } from './common';

// Bank Account schemas
export const BankAccountSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  accountHolderName: z
    .string()
    .min(2, 'Account holder name must be at least 2 characters')
    .max(100, 'Account holder name cannot exceed 100 characters'),
  accountNumber: z
    .string()
    .min(10, 'Account number must be at least 10 characters')
    .max(20, 'Account number cannot exceed 20 characters'),
  ifscCode: z.string().length(11, 'IFSC code must be exactly 11 characters'),
  bank: z
    .string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name cannot exceed 100 characters'),
  branch: z
    .string()
    .min(2, 'Branch must be at least 2 characters')
    .max(100, 'Branch cannot exceed 100 characters'),
  openingBalance: z.number().min(0, 'Opening balance must be non-negative'),
  openingBalanceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  currentBalance: z
    .number()
    .min(0, 'Current balance must be non-negative')
    .nullable()
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

export const CreateBankAccountSchema = z.object({
  pumpMasterId: z.string(),
  accountHolderName: z
    .string()
    .min(2, 'Account holder name must be at least 2 characters')
    .max(100, 'Account holder name cannot exceed 100 characters'),
  accountNumber: z
    .string()
    .min(10, 'Account number must be at least 10 characters')
    .max(20, 'Account number cannot exceed 20 characters'),
  ifscCode: z.string().length(11, 'IFSC code must be exactly 11 characters'),
  bank: z
    .string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name cannot exceed 100 characters'),
  branch: z
    .string()
    .min(2, 'Branch must be at least 2 characters')
    .max(100, 'Branch cannot exceed 100 characters'),
  openingBalance: z.number().min(0, 'Opening balance must be non-negative'),
  openingBalanceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const UpdateBankAccountSchema = CreateBankAccountSchema.partial();

// Bank Transaction schemas
export const BankTransactionSchema = z.object({
  id: z.string().optional(),
  bankAccountId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  transactionType: TransactionTypeSchema,
  paymentMethod: PaymentMethodSchema,
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description cannot exceed 255 characters'),
  transactionDate: z.string().optional(),
  entryBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateBankTransactionSchema = z.object({
  bankAccountId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  transactionType: TransactionTypeSchema,
  paymentMethod: PaymentMethodSchema,
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description cannot exceed 255 characters'),
  transactionDate: z.string().optional(),
  entryBy: z.string().optional(),
});

export const TransactionFormSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: PaymentMethodSchema,
  description: z.string().min(1, 'Description is required'),
  transactionDate: z.string().min(1, 'Transaction date is required'),
});

export type BankAccount = z.infer<typeof BankAccountSchema>;
export type CreateBankAccount = z.infer<typeof CreateBankAccountSchema>;
export type UpdateBankAccount = z.infer<typeof UpdateBankAccountSchema>;
export type BankTransaction = z.infer<typeof BankTransactionSchema>;
export type CreateBankTransaction = z.infer<typeof CreateBankTransactionSchema>;
export type TransactionFormValues = z.infer<typeof TransactionFormSchema>;
