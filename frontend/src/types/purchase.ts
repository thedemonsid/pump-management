import { z } from "zod";
import { RateTypeEnum, PaymentTypeEnum, PaymentMethodSchema } from "./common";

// Purchase Item schemas
export const PurchaseItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  productName: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  purchaseUnit: z.string().min(1, "Purchase unit is required"),
  purchaseRate: z.number().positive("Purchase rate must be positive"),
  amount: z.number().nonnegative("Amount must be non-negative"),
  taxPercentage: z.number().min(0, "Tax percentage must be non-negative"),
  taxAmount: z.number().nonnegative("Tax amount must be non-negative"),
  addToStock: z.boolean().default(false),
});

export const CreatePurchaseItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive("Quantity must be positive"),
  purchaseUnit: z.string().min(1, "Purchase unit is required").max(20),
  purchaseRate: z.number().positive("Purchase rate must be positive"),
  taxPercentage: z
    .number()
    .min(0, "Tax percentage must be non-negative")
    .default(0),
  addToStock: z.boolean().optional().default(false),
});

// Supplier Payment schemas
export const SupplierPaymentSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  purchaseId: z.string().optional(),
  supplierId: z.string(),
  bankAccountId: z.string(),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string(),
  paymentMethod: PaymentMethodSchema,
  referenceNumber: z.string(),
  notes: z.string().optional(),
});

export const CreateSupplierPurchasePaymentSchema = z.object({
  pumpMasterId: z.string(),
  purchaseId: z.string().optional(),
  supplierId: z.string(),
  bankAccountId: z.string(),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string(),
  paymentMethod: PaymentMethodSchema,
  referenceNumber: z.string().min(1).max(50),
  notes: z.string().max(255).optional(),
});

// Purchase schema (response from backend)
export const PurchaseSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  purchaseId: z.number().int().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  rateType: RateTypeEnum,
  paymentType: PaymentTypeEnum,
  supplierId: z.string(),
  supplierName: z.string(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  goodsReceivedBy: z.string().max(100).optional(),
  totalAmount: z.number().nonnegative("Total amount must be non-negative"),
  taxAmount: z.number().nonnegative("Tax amount must be non-negative"),
  netAmount: z.number().nonnegative("Net amount must be non-negative"),
  purchaseItems: z.array(PurchaseItemSchema).default([]),
  supplierPayments: z.array(SupplierPaymentSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

// Schema for creating a new purchase (matches CreatePurchaseRequest DTO)
export const CreatePurchaseSchema = z.object({
  pumpMasterId: z.string(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  rateType: RateTypeEnum,
  paymentType: PaymentTypeEnum,
  supplierId: z.string(),
  invoiceNumber: z.string().min(1, "Invoice number is required").max(50),
  goodsReceivedBy: z.string().max(100).optional(),
  purchaseItems: z
    .array(CreatePurchaseItemSchema)
    .min(1, "At least one item is required"),
  payments: z.array(CreateSupplierPurchasePaymentSchema).optional(),
});

export const UpdatePurchaseSchema = z.object({
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  rateType: RateTypeEnum,
  paymentType: PaymentTypeEnum,
  supplierId: z.string(),
  invoiceNumber: z.string().min(1, "Invoice number is required").max(50),
  goodsReceivedBy: z.string().max(100).optional(),
  purchaseItems: z
    .array(CreatePurchaseItemSchema)
    .min(1, "At least one item is required")
    .optional(),
  payments: z.array(CreateSupplierPurchasePaymentSchema).optional(),
});

export type PurchaseItem = z.infer<typeof PurchaseItemSchema>;
export type CreatePurchaseItem = z.infer<typeof CreatePurchaseItemSchema>;
export type SupplierPayment = z.infer<typeof SupplierPaymentSchema>;
export type CreateSupplierPurchasePayment = z.infer<
  typeof CreateSupplierPurchasePaymentSchema
>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export type CreatePurchase = z.infer<typeof CreatePurchaseSchema>;
export type UpdatePurchase = z.infer<typeof UpdatePurchaseSchema>;
