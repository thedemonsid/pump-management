import { z } from 'zod';
import { ProductSummarySchema } from './product';

// Tank schemas
export const TankSchema = z.object({
  id: z.string().optional(),
  pumpMasterId: z.string().optional(),
  tankName: z
    .string()
    .min(2, 'Tank name must be at least 2 characters')
    .max(100, 'Tank name cannot exceed 100 characters'),
  capacity: z.number().positive('Capacity must be positive'),
  currentLevel: z
    .number()
    .min(0, 'Current level cannot be negative')
    .optional(),
  lowLevelAlert: z
    .number()
    .min(0, 'Low level alert cannot be negative')
    .optional(),
  tankLocation: z
    .string()
    .max(50, 'Tank location cannot exceed 50 characters')
    .optional(),
  productId: z.string().optional(),
  product: ProductSummarySchema.optional(),
  nozzleCount: z.number().int().min(0).optional(),
  availableCapacity: z.number().min(0).optional(),
  fillPercentage: z.number().min(0).max(100).optional(),
  isLowLevel: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateTankSchema = TankSchema.omit({
  id: true,
  product: true,
  nozzleCount: true,
  availableCapacity: true,
  fillPercentage: true,
  isLowLevel: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTankSchema = CreateTankSchema.partial();

export type Tank = z.infer<typeof TankSchema>;
export type CreateTank = z.infer<typeof CreateTankSchema>;
export type UpdateTank = z.infer<typeof UpdateTankSchema>;
