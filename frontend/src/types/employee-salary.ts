import { z } from "zod";

// Enums
export const SalaryType = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;

export type SalaryType = (typeof SalaryType)[keyof typeof SalaryType];

export const PaymentMethod = {
  CASH: "CASH",
  UPI: "UPI",
  RTGS: "RTGS",
  NEFT: "NEFT",
  IMPS: "IMPS",
  CHEQUE: "CHEQUE",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Employee Salary Configuration Schemas
export const EmployeeSalaryConfigSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  username: z.string().optional(),
  pumpMasterId: z.string(),
  salaryType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  basicSalaryAmount: z
    .number()
    .positive("Basic salary amount must be greater than 0"),
  effectiveFrom: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  effectiveTo: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"),
  isActive: z.boolean().optional().default(true),
  halfDayRate: z
    .number()
    .min(0, "Half day rate must be between 0 and 1")
    .max(1, "Half day rate must be between 0 and 1")
    .default(0.5),
  overtimeRate: z
    .number()
    .min(0, "Overtime rate must be greater than or equal to 0")
    .default(1.5),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateEmployeeSalaryConfigSchema = EmployeeSalaryConfigSchema.omit(
  {
    id: true,
    username: true,
    createdAt: true,
    updatedAt: true,
  }
);

export const UpdateEmployeeSalaryConfigSchema = EmployeeSalaryConfigSchema.omit(
  {
    id: true,
    userId: true,
    username: true,
    pumpMasterId: true,
    createdAt: true,
    updatedAt: true,
  }
).partial();

export type EmployeeSalaryConfig = z.infer<typeof EmployeeSalaryConfigSchema>;
export type CreateEmployeeSalaryConfig = z.infer<
  typeof CreateEmployeeSalaryConfigSchema
>;
export type UpdateEmployeeSalaryConfig = z.infer<
  typeof UpdateEmployeeSalaryConfigSchema
>;

// Calculated Salary Schemas
export const CalculatedSalarySchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  username: z.string().optional(),
  pumpMasterId: z.string(),
  salaryConfigId: z.string(),
  fromDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  toDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  calculationDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  totalDays: z.number().min(0, "Total days must be greater than or equal to 0"),
  fullDayAbsences: z
    .number()
    .min(0, "Full day absences must be greater than or equal to 0"),
  halfDayAbsences: z
    .number()
    .min(0, "Half day absences must be greater than or equal to 0"),
  overtimeDays: z
    .number()
    .min(0, "Overtime days must be greater than or equal to 0"),
  workingDays: z
    .number()
    .min(0, "Working days must be greater than or equal to 0"),
  basicSalaryAmount: z
    .number()
    .min(0, "Basic salary amount must be greater than or equal to 0"),
  overtimeAmount: z
    .number()
    .min(0, "Overtime amount must be greater than or equal to 0"),
  additionalPayment: z
    .number()
    .min(0, "Additional payment must be greater than or equal to 0")
    .optional()
    .default(0),
  additionalDeduction: z
    .number()
    .min(0, "Additional deduction must be greater than or equal to 0")
    .optional()
    .default(0),
  grossSalary: z
    .number()
    .min(0, "Gross salary must be greater than or equal to 0"),
  netSalary: z.number().min(0, "Net salary must be greater than or equal to 0"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateCalculatedSalarySchema = CalculatedSalarySchema.omit({
  id: true,
  username: true,
  createdAt: true,
  updatedAt: true,
}).refine((data) => new Date(data.toDate) >= new Date(data.fromDate), {
  message: "To date must be greater than or equal to from date",
  path: ["toDate"],
});

export const UpdateCalculatedSalarySchema = CalculatedSalarySchema.omit({
  id: true,
  userId: true,
  username: true,
  pumpMasterId: true,
  salaryConfigId: true,
  createdAt: true,
  updatedAt: true,
})
  .partial()
  .refine(
    (data) => {
      if (data.toDate && data.fromDate) {
        return new Date(data.toDate) >= new Date(data.fromDate);
      }
      return true;
    },
    {
      message: "To date must be greater than or equal to from date",
      path: ["toDate"],
    }
  );

export type CalculatedSalary = z.infer<typeof CalculatedSalarySchema>;
export type CreateCalculatedSalary = z.infer<
  typeof CreateCalculatedSalarySchema
>;
export type UpdateCalculatedSalary = z.infer<
  typeof UpdateCalculatedSalarySchema
>;

// Employee Salary Payment Schemas
export const EmployeeSalaryPaymentSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  username: z.string().optional(),
  pumpMasterId: z.string(),
  calculatedSalaryId: z.string().nullable().optional(),
  bankAccountId: z.string(),
  bankAccountNumber: z.string().optional(),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  paymentMethod: z.enum(["CASH", "UPI", "RTGS", "NEFT", "IMPS", "CHEQUE"]),
  referenceNumber: z
    .string()
    .min(1, "Reference number is required")
    .max(100, "Reference number cannot exceed 100 characters"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateEmployeeSalaryPaymentSchema =
  EmployeeSalaryPaymentSchema.omit({
    id: true,
    username: true,
    bankAccountNumber: true,
    createdAt: true,
    updatedAt: true,
  });

export const UpdateEmployeeSalaryPaymentSchema =
  EmployeeSalaryPaymentSchema.omit({
    id: true,
    userId: true,
    username: true,
    pumpMasterId: true,
    bankAccountNumber: true,
    createdAt: true,
    updatedAt: true,
  }).partial();

export type EmployeeSalaryPayment = z.infer<typeof EmployeeSalaryPaymentSchema>;
export type CreateEmployeeSalaryPayment = z.infer<
  typeof CreateEmployeeSalaryPaymentSchema
>;
export type UpdateEmployeeSalaryPayment = z.infer<
  typeof UpdateEmployeeSalaryPaymentSchema
>;

// Additional Types for responses
export interface EmployeeBalanceResponse {
  openingBalance: number;
  totalSalary: number;
  totalPaid: number;
  netBalance: number;
}

export interface SalaryPeriodParams {
  startDate: string;
  endDate: string;
}

export interface PaymentPeriodParams {
  startDate: string;
  endDate: string;
}
