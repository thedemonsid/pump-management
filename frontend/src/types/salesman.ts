import { z } from 'zod';

// Salesman schemas
export const SalesmanSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  name: z.string().min(2, 'Salesman full name is required'),
  employeeId: z.string().min(2, 'Employee ID is required'),
  contactNumber: z.string().min(10, 'Contact phone number is required'),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().max(200),
  aadharCardNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 12,
      'Aadhar number must be 12 digits'
    ),
  panCardNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 10,
      'PAN number must be 10 characters'
    ),
  active: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateSalesmanSchema = SalesmanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSalesmanSchema = CreateSalesmanSchema.partial();

export type Salesman = z.infer<typeof SalesmanSchema>;
export type CreateSalesman = z.infer<typeof CreateSalesmanSchema>;
export type UpdateSalesman = z.infer<typeof UpdateSalesmanSchema>;
