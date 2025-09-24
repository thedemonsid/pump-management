import { z } from 'zod';

// Salesman Nozzle Shift schemas
export const SalesmanNozzleSummarySchema = z.object({
  id: z.string(),
  nozzleName: z.string(),
  nozzleCompanyName: z.string().optional(),
  nozzleLocation: z.string().optional(),
  nozzleStatus: z.string().optional(),
  tankId: z.string().optional(),
  tankName: z.string().optional(),
  productName: z.string(),
});

export const SalesmanNozzleSalesmanSummarySchema = z.object({
  id: z.string(),
  username: z.string(),
  mobileNumber: z.string(),
});

export const SalesmanNozzleShiftSchema = z.object({
  id: z.string().optional(),
  salesmanId: z.string(),
  nozzleId: z.string(),
  startDateTime: z.string(), // ISO datetime string
  endDateTime: z.string().optional(), // ISO datetime string, optional
  openingBalance: z.number().min(0), // Fuel quantity in liters
  closingBalance: z.number().min(0).optional(), // Fuel quantity in liters
  dispensedAmount: z.number().min(0).optional(), // closing - opening
  productPrice: z.number().min(0).optional(), // Price per liter
  totalAmount: z.number().min(0).optional(), // dispensedAmount × productPrice
  status: z.enum(['ACTIVE', 'CLOSED']).default('ACTIVE'),
  nozzle: SalesmanNozzleSummarySchema.optional(),
  salesman: SalesmanNozzleSalesmanSummarySchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateSalesmanNozzleShiftSchema = z.object({
  salesmanId: z.string(),
  nozzleId: z.string(),
  startDateTime: z.string().optional(), // ISO datetime string
  openingBalance: z.number().min(0),
});

export const CloseSalesmanNozzleShiftSchema = z.object({
  closingBalance: z.number().min(0),
  nextSalesmanId: z.string().optional(),
});

export type SalesmanNozzleShift = z.infer<typeof SalesmanNozzleShiftSchema>;
export type CreateSalesmanNozzleShift = z.infer<
  typeof CreateSalesmanNozzleShiftSchema
>;
export type CloseSalesmanNozzleShift = z.infer<
  typeof CloseSalesmanNozzleShiftSchema
>;
