import { z } from "zod";

// ============================================================================
// SALESMAN SHIFT TYPES (New Architecture)
// ============================================================================

/**
 * Shift status enum - matches backend SalesmanShift.ShiftStatus
 */
export const ShiftStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;

/**
 * Nozzle assignment status - matches backend NozzleAssignment.AssignmentStatus
 */
export const AssignmentStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Nozzle Assignment Response - Individual nozzle within a shift
 * Matches backend NozzleAssignmentResponse
 */
export const NozzleAssignmentResponseSchema = z.object({
  id: z.string(),
  shiftId: z.string(),
  nozzleId: z.string(),
  nozzleName: z.string(),
  salesmanId: z.string(),
  salesmanUsername: z.string(),
  startTime: z.string(), // ISO datetime
  endTime: z.string().optional(), // ISO datetime
  openingBalance: z.number(),
  closingBalance: z.number().optional(),
  dispensedAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  status: AssignmentStatusSchema,
  // Product info
  productName: z.string().optional(),
  productRate: z.number().optional(),
});

export type NozzleAssignmentResponse = z.infer<
  typeof NozzleAssignmentResponseSchema
>;

/**
 * Shift Response - Main shift information
 * Matches backend ShiftResponse
 */
export const ShiftResponseSchema = z.object({
  id: z.string(),
  salesmanId: z.string(),
  salesmanUsername: z.string(),
  salesmanFullName: z.string().optional(),
  pumpMasterId: z.string(),
  startDatetime: z.string(), // ISO datetime
  endDatetime: z.string().optional(), // ISO datetime
  openingCash: z.number(),
  status: ShiftStatusSchema,
  isAccountingDone: z.boolean().optional(),
  // Summary fields
  nozzleCount: z.number().optional(),
  openNozzleCount: z.number().optional(),
  totalFuelSales: z.number().optional(),
  totalCredit: z.number().optional(),
  totalPayments: z.number().optional(),
});

export type ShiftResponse = z.infer<typeof ShiftResponseSchema>;

/**
 * Shift Details Response - Extended shift information with nozzles
 * Matches backend ShiftDetailsResponse
 */
export const ShiftDetailsResponseSchema = ShiftResponseSchema.extend({
  nozzleAssignments: z.array(NozzleAssignmentResponseSchema).optional(),
  bills: z
    .array(
      z.object({
        billNo: z.number(),
        customerName: z.string(),
        productName: z.string(),
        quantity: z.number(),
        rate: z.number(),
        amount: z.number(),
        billDate: z.string(),
      })
    )
    .optional(),
  payments: z
    .array(
      z.object({
        customerName: z.string(),
        amount: z.number(),
        paymentDate: z.string(),
        paymentMethod: z.string(),
      })
    )
    .optional(),
  accounting: z
    .object({
      fuelSales: z.number(),
      customerReceipt: z.number(),
      credit: z.number(),
      cashInHand: z.number(),
      expenses: z.number(),
    })
    .optional(),
});

export type ShiftDetailsResponse = z.infer<typeof ShiftDetailsResponseSchema>;

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * Start Shift Request - Create a new shift
 * Matches backend StartShiftRequest
 */
export const StartShiftRequestSchema = z.object({
  salesmanId: z.string(),
  openingCash: z.number().min(0).default(0),
  startDatetime: z.string().optional(), // ISO datetime, defaults to now on backend
});

export type StartShiftRequest = z.infer<typeof StartShiftRequestSchema>;

/**
 * Add Nozzle Request - Assign a nozzle to an open shift
 * Matches backend AddNozzleRequest
 */
export const AddNozzleRequestSchema = z.object({
  nozzleId: z.string(),
  openingBalance: z.number().min(0),
  startTime: z.string().optional(), // ISO datetime, defaults to now on backend
});

export type AddNozzleRequest = z.infer<typeof AddNozzleRequestSchema>;

/**
 * Close Nozzle Request - Close a specific nozzle assignment
 * Matches backend CloseNozzleRequest
 */
export const CloseNozzleRequestSchema = z.object({
  closingBalance: z.number().min(0),
  endTime: z.string().optional(), // ISO datetime, defaults to now on backend
});

export type CloseNozzleRequest = z.infer<typeof CloseNozzleRequestSchema>;

/**
 * Close Shift Request - Close the entire shift (all nozzles must be closed first)
 * Matches backend close shift endpoint (no body required)
 */
export const CloseShiftRequestSchema = z.object({
  endDatetime: z.string().optional(), // ISO datetime, defaults to now on backend
});

export type CloseShiftRequest = z.infer<typeof CloseShiftRequestSchema>;

// ============================================================================
// SHIFT ACCOUNTING SCHEMAS
// ============================================================================

/**
 * Create Shift Accounting Request - Record shift accounting details
 * Matches backend CreateShiftAccountingRequest
 */
export const CreateShiftAccountingRequestSchema = z.object({
  upiReceived: z.number().min(0).default(0),
  cardReceived: z.number().min(0).default(0),
  expenses: z.number().min(0).default(0),
  expenseReason: z.string().optional(),
  // Cash denomination counts
  notes2000: z.number().min(0).default(0),
  notes500: z.number().min(0).default(0),
  notes200: z.number().min(0).default(0),
  notes100: z.number().min(0).default(0),
  notes50: z.number().min(0).default(0),
  notes20: z.number().min(0).default(0),
  notes10: z.number().min(0).default(0),
  coins10: z.number().min(0).default(0),
  coins5: z.number().min(0).default(0),
  coins2: z.number().min(0).default(0),
  coins1: z.number().min(0).default(0),
});

export type CreateShiftAccountingRequest = z.infer<
  typeof CreateShiftAccountingRequestSchema
>;

/**
 * Shift Accounting Response - Accounting details for a shift
 * Matches backend SalesmanShiftAccountingResponse
 */
export const ShiftAccountingResponseSchema = z.object({
  id: z.string(),
  shiftId: z.string(),
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
  // Denominations
  notes2000: z.number(),
  notes500: z.number(),
  notes200: z.number(),
  notes100: z.number(),
  notes50: z.number(),
  notes20: z.number(),
  notes10: z.number(),
  coins10: z.number(),
  coins5: z.number(),
  coins2: z.number(),
  coins1: z.number(),
});

export type ShiftAccountingResponse = z.infer<
  typeof ShiftAccountingResponseSchema
>;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Shift summary for list views
 */
export const ShiftSummarySchema = z.object({
  id: z.string(),
  salesmanUsername: z.string(),
  startDatetime: z.string(),
  endDatetime: z.string().optional(),
  status: ShiftStatusSchema,
  nozzleCount: z.number(),
  totalFuelSales: z.number(),
});

export type ShiftSummary = z.infer<typeof ShiftSummarySchema>;
