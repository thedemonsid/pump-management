import { z } from "zod";
import { ProductType } from "./product";

// Product Sales Unit Change Log schema
export const ProductSalesUnitChangeLogSchema = z.object({
  id: z.string(),
  pumpMasterId: z.string(),
  productId: z.string(),
  productName: z.string(),
  productType: z.enum([ProductType.FUEL, ProductType.GENERAL]),
  oldSalesUnit: z.string(),
  newSalesUnit: z.string(),
  oldStockQuantity: z.number().nullable().optional(),
  newStockQuantity: z.number().nullable().optional(),
  oldSalesRate: z.number().nullable().optional(),
  newSalesRate: z.number().nullable().optional(),
  changeReason: z.string().nullable().optional(),
  changedBy: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProductSalesUnitChangeLog = z.infer<
  typeof ProductSalesUnitChangeLogSchema
>;

// Create request schema
export const CreateProductSalesUnitChangeLogSchema = z.object({
  productId: z.string(),
  oldSalesUnit: z.string(),
  newSalesUnit: z.string(),
  oldStockQuantity: z.number().nullable().optional(),
  newStockQuantity: z.number().nullable().optional(),
  oldSalesRate: z.number().nullable().optional(),
  newSalesRate: z.number().nullable().optional(),
  changeReason: z.string().nullable().optional(),
  changedBy: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
});

export type CreateProductSalesUnitChangeLog = z.infer<
  typeof CreateProductSalesUnitChangeLogSchema
>;
