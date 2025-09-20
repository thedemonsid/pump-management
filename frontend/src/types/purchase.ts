import { z } from 'zod';
import { RateTypeEnum, PaymentTypeEnum } from './common';

// Purchase schemas
export const PurchaseSchema = z.object({
  id: z.uuid().optional(),
  pumpMasterId: z.uuid(),
  purchaseId: z.number().int().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  rateType: RateTypeEnum,
  paymentType: PaymentTypeEnum,
  supplierId: z.uuid(),
  supplierName: z.string(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  addToStock: z.boolean().default(false),
  productId: z.uuid(),
  productName: z.string(),
  quantity: z.number().positive('Quantity must be positive'),
  purchaseRate: z.number().positive('Purchase rate must be positive'),
  amount: z.number().positive('Amount must be positive'),
  goodsReceivedBy: z.string().max(100).optional(),
  purchaseUnit: z.string().min(1, 'Purchase unit is required'),
  taxPercentage: z.number().min(0, 'Tax percentage must be non-negative'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

// Schema for creating a new purchase (matches CreatePurchaseRequest DTO)
export const CreatePurchaseSchema = z.object({
  pumpMasterId: z.uuid(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  rateType: RateTypeEnum,
  paymentType: PaymentTypeEnum,
  supplierId: z.uuid(),
  invoiceNumber: z.string().min(1, 'Invoice number is required').max(50),
  addToStock: z.boolean().optional(),
  productId: z.uuid(),
  quantity: z.number().positive('Quantity must be positive'),
  purchaseRate: z.number().positive('Purchase rate must be positive'),
  amount: z.number().positive('Amount must be positive'),
  goodsReceivedBy: z.string().max(100).optional(),
  purchaseUnit: z.string().min(1, 'Purchase unit is required').max(20),
  taxPercentage: z.number().min(0, 'Tax percentage must be non-negative'),
});

export const UpdatePurchaseSchema = z.object({
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional(),
  rateType: RateTypeEnum.optional(),
  paymentType: PaymentTypeEnum.optional(),
  supplierId: z.uuid().optional(),
  invoiceNumber: z
    .string()
    .min(1, 'Invoice number is required')
    .max(50)
    .optional(),
  addToStock: z.boolean().optional(),
  productId: z.uuid().optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  purchaseRate: z
    .number()
    .positive('Purchase rate must be positive')
    .optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  goodsReceivedBy: z.string().max(100).optional(),
  purchaseUnit: z
    .string()
    .min(1, 'Purchase unit is required')
    .max(20)
    .optional(),
  taxPercentage: z
    .number()
    .min(0, 'Tax percentage must be non-negative')
    .optional(),
});

export type Purchase = z.infer<typeof PurchaseSchema>;
export type CreatePurchase = z.infer<typeof CreatePurchaseSchema>;
export type UpdatePurchase = z.infer<typeof UpdatePurchaseSchema>;
