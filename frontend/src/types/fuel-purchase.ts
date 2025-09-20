import { z } from 'zod';
import { RateTypeEnum, PaymentTypeEnum } from './common';

// Fuel Purchase schemas
export const FuelPurchaseSchema = z.object({
  id: z.uuid().optional(),
  pumpMasterId: z.uuid(),
  fuelPurchaseId: z.number().int().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  rateType: RateTypeEnum,
  paymentType: PaymentTypeEnum,
  supplierId: z.uuid(),
  supplierName: z.string(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  addToStock: z.boolean().default(false),
  tankId: z.uuid(),
  tankName: z.string(),
  productId: z.uuid(),
  productName: z.string(),
  quantity: z.number().positive('Quantity must be positive'),
  purchaseRate: z.number().positive('Purchase rate must be positive'),
  amount: z.number().positive('Amount must be positive'),
  vehicle: z.string().max(100).optional(),
  goodsReceivedBy: z.string().max(100).optional(),
  purchaseUnit: z.string().min(1, 'Purchase unit is required'),
  taxPercentage: z.number().min(0, 'Tax percentage must be non-negative'),
  readingKm: z.number().min(0, 'Reading km must be non-negative').optional(),
  density: z.number().positive('Density must be positive'),
  dipReading: z.number().min(0, 'DIP reading must be non-negative'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

// Schema for creating a new fuel purchase (matches CreateFuelPurchaseRequest DTO)
export const CreateFuelPurchaseSchema = z.object({
  pumpMasterId: z.uuid(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  rateType: RateTypeEnum,
  paymentType: PaymentTypeEnum,
  supplierId: z.uuid(),
  invoiceNumber: z.string().min(1, 'Invoice number is required').max(50),
  addToStock: z.boolean().optional(),
  tankId: z.uuid(),
  quantity: z.number().positive('Quantity must be positive'),
  purchaseRate: z.number().positive('Purchase rate must be positive'),
  amount: z.number().positive('Amount must be positive'),
  vehicle: z.string().max(100).optional(),
  goodsReceivedBy: z.string().max(100).optional(),
  purchaseUnit: z.string().min(1, 'Purchase unit is required').max(20),
  taxPercentage: z.number().min(0, 'Tax percentage must be non-negative'),
  readingKm: z.number().min(0, 'Reading km must be non-negative').optional(),
  density: z.number().positive('Density must be positive'),
  dipReading: z.number().min(0, 'DIP reading must be non-negative'),
});

export const UpdateFuelPurchaseSchema = z.object({
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
  tankId: z.uuid().optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  purchaseRate: z
    .number()
    .positive('Purchase rate must be positive')
    .optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  vehicle: z.string().max(100).optional(),
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
  readingKm: z.number().min(0, 'Reading km must be non-negative').optional(),
  density: z.number().positive('Density must be positive').optional(),
  dipReading: z.number().min(0, 'DIP reading must be non-negative').optional(),
});

export type FuelPurchase = z.infer<typeof FuelPurchaseSchema>;
export type CreateFuelPurchase = z.infer<typeof CreateFuelPurchaseSchema>;
export type UpdateFuelPurchase = z.infer<typeof UpdateFuelPurchaseSchema>;
