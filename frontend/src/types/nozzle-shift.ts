import { z } from 'zod';

// Nozzle Shift schemas
export const NozzleSummarySchema = z.object({
  id: z.string(),
  nozzleName: z.string(),
  companyName: z.string(),
});

export const SalesmanSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  employeeId: z.string(),
});

export const NozzleShiftResponseSchema = z.object({
  id: z.string(),
  shiftDate: z.string(), // LocalDate as string
  openingTime: z.string(), // LocalTime as string
  closingTime: z.string().optional(), // LocalTime as string, optional
  nozzleId: z.string(),
  salesmanId: z.string(),
  openingReading: z.number().min(0),
  closingReading: z.number().min(0).optional(),
  fuelPrice: z.number().min(0),
  nextSalesmanId: z.string().optional(),
  dispensedAmount: z.number().min(0).optional(),
  totalValue: z.number().min(0).optional(),
  closed: z.boolean(),
  nozzle: NozzleSummarySchema,
  salesman: SalesmanSummarySchema,
  nextSalesman: SalesmanSummarySchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateNozzleShiftRequestSchema = z.object({
  shiftDate: z.string(), // LocalDate as string
  openingTime: z.string(), // LocalTime as string
  nozzleId: z.string(),
  salesmanId: z.string(),
  openingReading: z.number().min(0),
  fuelPrice: z.number().min(0),
  nextSalesmanId: z.string().optional(),
});

export const UpdateNozzleShiftRequestSchema = z.object({
  closingTime: z.string().optional(), // LocalTime as string
  closingReading: z.number().min(0).optional(),
  fuelPrice: z.number().min(0).optional(),
  nextSalesmanId: z.string().optional(),
  closed: z.boolean().optional(),
});

// Type exports
export type NozzleSummary = z.infer<typeof NozzleSummarySchema>;
export type SalesmanSummary = z.infer<typeof SalesmanSummarySchema>;
export type NozzleShiftResponse = z.infer<typeof NozzleShiftResponseSchema>;
export type CreateNozzleShiftRequest = z.infer<
  typeof CreateNozzleShiftRequestSchema
>;
export type UpdateNozzleShiftRequest = z.infer<
  typeof UpdateNozzleShiftRequestSchema
>;
