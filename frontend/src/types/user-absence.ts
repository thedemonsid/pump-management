import { z } from "zod";

// Absence Type constant
export const AbsenceType = {
  FULL_DAY: "FULL_DAY",
  HALF_DAY: "HALF_DAY",
  OVERTIME: "OVERTIME",
} as const;

export type AbsenceType = (typeof AbsenceType)[keyof typeof AbsenceType];

// User Absence schemas
export const UserAbsenceSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  username: z.string().optional(),
  userRole: z.string().optional(),
  pumpMasterId: z.string(),
  absenceDate: z.string(), // ISO date string
  absenceType: z
    .enum(["FULL_DAY", "HALF_DAY", "OVERTIME"])
    .default(AbsenceType.FULL_DAY),
  reason: z
    .string()
    .max(500, "Reason must not exceed 500 characters")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .optional(),
  isApproved: z.boolean().default(false),
  approvedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

export const CreateUserAbsenceSchema = UserAbsenceSchema.omit({
  id: true,
  username: true,
  userRole: true,
  approvedBy: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

export const UpdateUserAbsenceSchema = z.object({
  absenceDate: z.string().optional(),
  absenceType: z.enum(["FULL_DAY", "HALF_DAY", "OVERTIME"]).optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  isApproved: z.boolean().optional(),
});

export type UserAbsence = z.infer<typeof UserAbsenceSchema>;
export type CreateUserAbsence = z.infer<typeof CreateUserAbsenceSchema>;
export type UpdateUserAbsence = z.infer<typeof UpdateUserAbsenceSchema>;
