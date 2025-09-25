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

// Salesman Nozzle Shift Response Schema (matches backend API response exactly)
export const SalesmanNozzleShiftResponseSchema = z.object({
  id: z.string(),
  pumpMasterId: z.string(),
  salesmanId: z.string(),
  salesmanUsername: z.string(),
  nozzleId: z.string(),
  nozzleName: z.string(),
  nozzleCompanyName: z.string(),
  nozzleLocation: z.string(),
  nozzleStatus: z.string(),
  tankId: z.string(),
  tankName: z.string(),
  productName: z.string(),
  startDateTime: z.string(),
  endDateTime: z.string().optional(),
  openingBalance: z.number(),
  closingBalance: z.number().optional(),
  productPrice: z.number(),
  totalAmount: z.number(),
  status: z.enum(['ACTIVE', 'CLOSED', 'OPEN']),
  dispensedAmount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
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

export type SalesmanNozzleShift = z.infer<
  typeof SalesmanNozzleShiftResponseSchema
>;
export type SalesmanNozzleShiftResponse = z.infer<
  typeof SalesmanNozzleShiftResponseSchema
>;
export type CreateSalesmanNozzleShift = z.infer<
  typeof CreateSalesmanNozzleShiftSchema
>;
export type CloseSalesmanNozzleShift = z.infer<
  typeof CloseSalesmanNozzleShiftSchema
>;
