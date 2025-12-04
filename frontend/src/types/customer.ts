import { z } from "zod";

// Customer schemas
export const CustomerSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name cannot exceed 100 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(255, "Address cannot exceed 255 characters"),
  pincode: z
    .string()
    .min(5, "Pincode must be at least 5 characters")
    .max(10, "Pincode cannot exceed 10 characters"),
  phoneNumber: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d{10}$/, "Phone number must contain only digits"),
  gstNumber: z
    .string()
    .nullable()
    .refine(
      (val) =>
        val === null || val === "" || (val.length >= 10 && val.length <= 20),
      "GST number must be empty, null, or 10-20 characters"
    ),
  panNumber: z
    .string()
    .nullable()
    .refine(
      (val) =>
        val === null || val === "" || (val.length >= 10 && val.length <= 20),
      "PAN number must be empty, null, or 10-20 characters"
    ),
  creditLimit: z.number().min(0, "Credit limit cannot be negative"),
  openingBalance: z.number().optional(),
  openingBalanceDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

export const CreateCustomerSchema = CustomerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
}).extend({
  openingBalance: z.number().min(0, "Opening balance must be >= 0"),
  openingBalanceDate: z
    .string()
    .refine((val) => val && !isNaN(Date.parse(val)), "Invalid date format"),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;
