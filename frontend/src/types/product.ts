import { z } from "zod";

// Product type enum
export const ProductType = {
  FUEL: "FUEL",
  GENERAL: "GENERAL",
} as const;

export type ProductType = (typeof ProductType)[keyof typeof ProductType];

// Product schemas
export const ProductSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string().optional(),
  gstPercentage: z.number().int().min(0, "GST percentage must be non-negative"),
  productType: z
    .enum([ProductType.FUEL, ProductType.GENERAL])
    .default(ProductType.GENERAL),
  productName: z.string().min(1, "Product name is required"),
  alias: z.string().min(1, "Alias is required"),
  lowStockCount: z
    .number()
    .int()
    .min(0, "Low stock count must be non-negative"),
  purchaseRate: z.number().positive("Purchase rate must be positive"),
  salesRate: z.number().positive("Sales rate must be positive"),
  hsnCode: z.string().min(1, "HSN code is required"),
  salesUnit: z.string().min(1, "Sales unit is required"),
  purchaseUnit: z.string().min(1, "Purchase unit is required"),
  stockConversionRatio: z
    .number()
    .positive("Stock conversion ratio must be positive"),
  stockQuantity: z.number().int().optional(),
  openingBalance: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProductSchema = CreateProductSchema.partial();

// Product Summary schema for tank response
export const ProductSummarySchema = z.object({
  id: z.uuid(),
  productName: z.string(),
  salesUnit: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductSummary = z.infer<typeof ProductSummarySchema>;
