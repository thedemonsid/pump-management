import { z } from 'zod';

// Common schemas and enums
export const PumpInfoMasterSchema = z.object({
  id: z.string().optional(),
  pumpId: z.number().int().positive(),
  pumpCode: z.string().min(1, 'Pump code is required'),
  pumpName: z.string().min(1, 'Pump name is required'),
});

export const LocalTimeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
    'Invalid time format (HH:MM:SS)'
  );

// Enums
export const RateTypeEnum = z.enum(['INCLUDING_GST', 'EXCLUDING_GST']);
export const PaymentTypeEnum = z.enum(['CASH', 'CREDIT']);
export const TransactionTypeSchema = z.enum(['CREDIT', 'DEBIT']);

// Bill schemas
export const BillTypeSchema = z.enum(['GENERAL', 'SALESMAN']);

export const CreateBillItemRequestSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(0.01, 'Quantity must be at least 0.01'),
  rate: z.number().min(0.01, 'Rate must be at least 0.01'),
  gst: z
    .number()
    .min(0, 'GST must be non-negative')
    .max(100, 'GST cannot exceed 100%')
    .optional(),
  discount: z
    .number()
    .min(0, 'Discount must be non-negative')
    .max(100, 'Discount cannot exceed 100%')
    .optional(),
});

export const PaymentMethodSchema = z.enum([
  'CASH',
  'UPI',
  'RTGS',
  'NEFT',
  'IMPS',
  'CHEQUE',
]);

export const CreateBillPaymentRequestSchema = z.object({
  pumpMasterId: z.uuid('Pump Master ID must be a valid UUID'),
  billId: z.uuid().optional(),
  customerId: z.uuid('Customer ID must be a valid UUID'),
  bankAccountId: z.uuid('Bank Account ID must be a valid UUID'),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: PaymentMethodSchema,
  referenceNumber: z
    .string()
    .min(1, 'Reference number is required')
    .max(50, 'Reference number must be less than 50 characters'),
  notes: z
    .string()
    .max(255, 'Notes must be less than 255 characters')
    .optional(),
});

export const UpdateBillRequestSchema = z.object({
  billNo: z.number().int().positive().optional(),
  billDate: z.string().optional(),
  customerId: z.string().optional(),
  rateType: RateTypeEnum.optional(),
  billItems: z.array(CreateBillItemRequestSchema).optional(),
});

export const CreateBillRequestSchema = z.object({
  pumpMasterId: z.string().uuid('Pump Master ID must be a valid UUID'),
  billNo: z.number().int().positive('Bill number must be positive'),
  billDate: z.string().min(1, 'Bill date is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  paymentType: PaymentTypeEnum,
  rateType: RateTypeEnum,
  billItems: z
    .array(CreateBillItemRequestSchema)
    .min(1, 'At least one bill item is required'),
  discountAmount: z
    .number()
    .min(0, 'Discount amount must be non-negative')
    .optional(),
  payments: z.array(CreateBillPaymentRequestSchema).optional(),
});

export type PumpInfoMaster = z.infer<typeof PumpInfoMasterSchema>;
export type LocalTime = z.infer<typeof LocalTimeSchema>;
export type CreateBillItemRequest = z.infer<typeof CreateBillItemRequestSchema>;
export type CreateCustomerBillPaymentRequest = z.infer<
  typeof CreateBillPaymentRequestSchema
>;
export type CreateBillRequest = z.infer<typeof CreateBillRequestSchema>;
export type UpdateBillRequest = z.infer<typeof UpdateBillRequestSchema>;
export type RateType = z.infer<typeof RateTypeEnum>;
export type PaymentType = z.infer<typeof PaymentTypeEnum>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// Default pump info
export const DEFAULT_PUMP_INFO: PumpInfoMaster = {
  id: '30cddb89-4d14-4214-89d8-d25c0442ba9a',
  pumpId: 1,
  pumpCode: 'PUMP001',
  pumpName: 'Pump 001',
};
