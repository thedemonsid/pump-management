import { z } from 'zod';
import { LocalTimeSchema } from './common';

// Shift schemas
export const CreateShiftSchema = z.object({
  pumpMasterId: z.uuid(),
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  startTime: LocalTimeSchema,
  endTime: LocalTimeSchema,
});

export const UpdateShiftSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  startTime: LocalTimeSchema.optional(),
  endTime: LocalTimeSchema.optional(),
  isActive: z.boolean().optional(),
});

export const ShiftSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.uuid(),
  name: z.string().min(2, 'Shift name is required'),
  description: z.string().max(200).optional(),
  startTime: LocalTimeSchema,
  endTime: LocalTimeSchema,
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const SalesmanShiftSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.uuid().optional(),
  shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  active: z.boolean().default(true),
});

export type Shift = z.infer<typeof ShiftSchema>;
export type CreateShift = z.infer<typeof CreateShiftSchema>;
export type UpdateShift = z.infer<typeof UpdateShiftSchema>;
export type SalesmanShift = z.infer<typeof SalesmanShiftSchema>;
