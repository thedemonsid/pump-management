import { z } from "zod";

// User schemas
export const UserSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be between 3 and 50 characters"),
  mobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Mobile number should be valid"),
  role: z.string(),
  enabled: z.boolean().default(true),
  openingBalance: z.number().default(0),
  openingBalanceDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid date format"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
});

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
}).partial();

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
