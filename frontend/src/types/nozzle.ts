import { z } from 'zod';
import { TankSchema } from './tank';

// Nozzle schemas
export const NozzleSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string().optional(),
  nozzleName: z.string().min(2).max(50),
  companyName: z.string().max(100),
  currentReading: z.number().min(0),
  location: z.string().max(50).optional(),
  tankId: z.string(),
  productName: z.string().optional(),
  tank: TankSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateNozzleSchema = NozzleSchema.omit({
  id: true,
  productName: true,
  tank: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateNozzleSchema = CreateNozzleSchema.partial();

export type Nozzle = z.infer<typeof NozzleSchema>;
export type CreateNozzle = z.infer<typeof CreateNozzleSchema>;
export type UpdateNozzle = z.infer<typeof UpdateNozzleSchema>;
