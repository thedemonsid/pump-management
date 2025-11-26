import { z } from "zod";

// Employee Ledger Entry
export const EmployeeLedgerEntrySchema = z.object({
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  action: z.string(), // "Salary Calculated" or "Payment Made"
  type: z.enum(["credit", "debit"]),
  creditAmount: z.number().min(0),
  debitAmount: z.number().min(0),
  balance: z.number(),
  description: z.string(),
  referenceId: z.string(),
  referenceType: z.enum(["SALARY", "PAYMENT"]),
  paymentMethod: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export type EmployeeLedgerEntry = z.infer<typeof EmployeeLedgerEntrySchema>;

// Employee Ledger Summary
export const EmployeeLedgerSummarySchema = z.object({
  openingBalance: z.number(),
  totalSalariesBefore: z.number().min(0),
  totalPaymentsBefore: z.number().min(0),
  balanceBefore: z.number(),
  totalSalariesInRange: z.number().min(0),
  totalPaymentsInRange: z.number().min(0),
  totalSalariesTillDate: z.number().min(0),
  totalPaymentsTillDate: z.number().min(0),
  closingBalance: z.number(),
});

export type EmployeeLedgerSummary = z.infer<typeof EmployeeLedgerSummarySchema>;

// Employee Ledger Response
export const EmployeeLedgerResponseSchema = z.object({
  ledgerEntries: z.array(EmployeeLedgerEntrySchema),
  summary: EmployeeLedgerSummarySchema,
});

export type EmployeeLedgerResponse = z.infer<
  typeof EmployeeLedgerResponseSchema
>;

// Employee Ledger State (for Zustand store)
export interface EmployeeLedgerState {
  ledgerData: EmployeeLedgerEntry[];
  summary: EmployeeLedgerSummary;
  loading: boolean;
  hasSearched: boolean;
  error: string | null;
}

// Compute Employee Ledger Parameters
export interface ComputeEmployeeLedgerParams {
  userId: string;
  fromDate: string;
  toDate: string;
}
