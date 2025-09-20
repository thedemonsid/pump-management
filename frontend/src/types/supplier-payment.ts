import { z } from 'zod';

// Supplier Payment Method enum
export const SupplierPaymentMethod = {
  CASH: 'CASH',
  UPI: 'UPI',
  RTGS: 'RTGS',
  NEFT: 'NEFT',
  IMPS: 'IMPS',
  CHEQUE: 'CHEQUE',
} as const;

export type SupplierPaymentMethod =
  (typeof SupplierPaymentMethod)[keyof typeof SupplierPaymentMethod];

// Supplier Payment Response schema
export const SupplierPaymentResponseSchema = z.object({
  id: z.string(),
  pumpMasterId: z.string(),
  purchaseId: z.string().optional(),
  fuelPurchaseId: z.string().optional(),
  supplierId: z.string(),
  bankAccountId: z.string(),
  amount: z.number(),
  paymentDate: z.string(),
  paymentMethod: z.nativeEnum(SupplierPaymentMethod),
  referenceNumber: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Create Supplier Payment Request schema
export const CreateSupplierPaymentRequestSchema = z.object({
  pumpMasterId: z.string().min(1, 'Pump master ID is required'),
  purchaseId: z.string().optional(),
  fuelPurchaseId: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier ID is required'),
  bankAccountId: z.string().min(1, 'Bank account ID is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0.00'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.nativeEnum(SupplierPaymentMethod),
  referenceNumber: z
    .string()
    .min(1, 'Reference number is required')
    .max(50, 'Reference number must be between 1 and 50 characters'),
  notes: z
    .string()
    .max(255, 'Notes must be less than 255 characters')
    .optional(),
});

// Update Supplier Payment Request schema
export const UpdateSupplierPaymentRequestSchema = z.object({
  pumpMasterId: z.string().optional(),
  purchaseId: z.string().optional(),
  fuelPurchaseId: z.string().optional(),
  supplierId: z.string().optional(),
  bankAccountId: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0.00').optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.nativeEnum(SupplierPaymentMethod).optional(),
  referenceNumber: z
    .string()
    .min(1, 'Reference number must be between 1 and 50 characters')
    .max(50)
    .optional(),
  notes: z
    .string()
    .max(255, 'Notes must be less than 255 characters')
    .optional(),
});

// Type exports
export type SupplierPaymentResponse = z.infer<
  typeof SupplierPaymentResponseSchema
>;
export type CreateSupplierPaymentRequest = z.infer<
  typeof CreateSupplierPaymentRequestSchema
>;
export type UpdateSupplierPaymentRequest = z.infer<
  typeof UpdateSupplierPaymentRequestSchema
>;
