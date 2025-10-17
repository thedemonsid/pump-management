import { z } from "zod";

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
  status: z.enum(["ACTIVE", "CLOSED", "OPEN"]),
  dispensedAmount: z.number(),
  isAccountingDone: z.boolean().optional(),
  customerReceipt: z.number().optional(), // Payment received from credit customers
  credit: z.number().optional(), // Credit given to customers during this shift
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

// Accounting schemas
export const CreateSalesmanShiftAccountingRequestSchema = z.object({
  upiReceived: z.number().min(0).default(0),
  cardReceived: z.number().min(0).default(0),
  expenses: z.number().min(0).default(0),
  expenseReason: z.string().optional(),
  notes2000: z.number().min(0).default(0),
  notes1000: z.number().min(0).default(0),
  notes500: z.number().min(0).default(0),
  notes200: z.number().min(0).default(0),
  notes100: z.number().min(0).default(0),
  notes50: z.number().min(0).default(0),
  notes20: z.number().min(0).default(0),
  notes10: z.number().min(0).default(0),
  coins5: z.number().min(0).default(0), // Separate coin fields to match backend
  coins2: z.number().min(0).default(0),
  coins1: z.number().min(0).default(0),
});

export const SalesmanShiftAccountingResponseSchema = z.object({
  id: z.string(),
  shiftId: z.string(), // Changed from salesmanNozzleShiftId to match backend
  fuelSales: z.number(),
  customerReceipt: z.number(),
  systemReceivedAmount: z.number(),
  credit: z.number(),
  upiReceived: z.number(),
  cardReceived: z.number(),
  expenses: z.number(),
  expenseReason: z.string().optional(),
  cashInHand: z.number(),
  balanceAmount: z.number(),
  notes2000: z.number(),
  notes1000: z.number(),
  notes500: z.number(),
  notes200: z.number(),
  notes100: z.number(),
  notes50: z.number(),
  notes20: z.number(),
  notes10: z.number(),
  coins5: z.number(), // Separate coin fields to match backend
  coins2: z.number(),
  coins1: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(), // Added version field from backend
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
export type CreateSalesmanShiftAccountingRequest = z.infer<
  typeof CreateSalesmanShiftAccountingRequestSchema
>;
export type SalesmanShiftAccounting = z.infer<
  typeof SalesmanShiftAccountingResponseSchema
>;
