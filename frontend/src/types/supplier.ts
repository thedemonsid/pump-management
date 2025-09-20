import { z } from 'zod';

// Supplier schemas
export const SupplierSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  supplierName: z
    .string()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(100, 'Supplier name cannot exceed 100 characters'),
  contactPersonName: z
    .string()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(100, 'Contact person name cannot exceed 100 characters'),
  contactNumber: z
    .string()
    .min(10, 'Contact number must be at least 10 characters')
    .max(15, 'Contact number cannot exceed 15 characters'),
  email: z
    .string()
    .email('Invalid email format')
    .max(200, 'Email cannot exceed 200 characters')
    .optional(),
  gstNumber: z.string().length(15, 'GST Number must be exactly 15 characters'),
  taxIdentificationNumber: z
    .string()
    .length(11, 'Tax Identification Number must be exactly 11 characters'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address cannot exceed 255 characters'),
  openingBalance: z.number().optional(),
  openingBalanceDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

export const CreateSupplierSchema = SupplierSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export type Supplier = z.infer<typeof SupplierSchema>;
export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema>;
