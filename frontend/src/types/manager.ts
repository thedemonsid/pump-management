import { z } from "zod";

// Manager schemas
export const ManagerSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string(),
  username: z
    .string()
    .min(3, "Username is required")
    .max(50, "Username must be between 3 and 50 characters"),
  mobileNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Mobile number should be valid"),
  email: z.email("Invalid email address").optional().or(z.literal("")),
  aadharNumber: z
    .string()
    .max(12, "Aadhar number cannot exceed 12 characters")
    .optional(),
  panNumber: z
    .string()
    .max(10, "PAN number cannot exceed 10 characters")
    .optional(),
  enabled: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

export const CreateManagerSchema = ManagerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateManagerSchema = CreateManagerSchema.partial();

export type Manager = z.infer<typeof ManagerSchema>;
export type CreateManager = z.infer<typeof CreateManagerSchema>;
export type UpdateManager = z.infer<typeof UpdateManagerSchema>;
