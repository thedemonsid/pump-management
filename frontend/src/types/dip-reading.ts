import { z } from "zod";

// Tank Summary for Dip Reading Response
export const TankSummarySchema = z.object({
  id: z.string(),
  tankName: z.string(),
  capacity: z.number(),
  productName: z.string(),
  currentLevel: z.number().optional(),
  tankLocation: z.string().optional(),
});

// Dip Reading schemas
export const DipReadingSchema = z.object({
  id: z.string(),
  tankId: z.string(),
  tankName: z.string(),
  pumpMasterId: z.string(),
  pumpMasterName: z.string(),
  productName: z.string(),
  readingTimestamp: z.string(),
  dipLevel: z.number().min(0).optional(),
  density: z.number().min(0).optional(),
  temperature: z.number().optional(),
  fuelLevelLitres: z.number().min(0).optional(),
  fuelLevelSystem: z.number().min(0).optional(),
  variance: z.number().optional(),
  remarks: z.string().optional(),
  tank: TankSummarySchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  entryBy: z.string(),
});

export const CreateDipReadingSchema = z.object({
  tankId: z.string().min(1, "Tank is required"),
  pumpMasterId: z.string().min(1, "Pump Master is required"),
  dipLevel: z.number().min(0, "Dip level must be non-negative").optional(),
  density: z.number().min(0, "Density must be non-negative").optional(),
  temperature: z.number().optional(),
  fuelLevelLitres: z
    .number()
    .min(0, "Fuel level in litres must be non-negative")
    .optional(),
  fuelLevelSystem: z
    .number()
    .min(0, "System fuel level must be non-negative")
    .optional(),
  variance: z.number().optional(),
  remarks: z
    .string()
    .max(500, "Remarks cannot exceed 500 characters")
    .optional(),
});

export const UpdateDipReadingSchema = CreateDipReadingSchema;

// Paginated response
export const PaginatedDipReadingSchema = z.object({
  content: z.array(DipReadingSchema),
  pageable: z.object({
    pageNumber: z.number(),
    pageSize: z.number(),
    sort: z.object({
      empty: z.boolean(),
      sorted: z.boolean(),
      unsorted: z.boolean(),
    }),
    offset: z.number(),
    paged: z.boolean(),
    unpaged: z.boolean(),
  }),
  totalPages: z.number(),
  totalElements: z.number(),
  last: z.boolean(),
  first: z.boolean(),
  size: z.number(),
  number: z.number(),
  sort: z.object({
    empty: z.boolean(),
    sorted: z.boolean(),
    unsorted: z.boolean(),
  }),
  numberOfElements: z.number(),
  empty: z.boolean(),
});

// Types
export type TankSummary = z.infer<typeof TankSummarySchema>;
export type DipReading = z.infer<typeof DipReadingSchema>;
export type CreateDipReading = z.infer<typeof CreateDipReadingSchema>;
export type UpdateDipReading = z.infer<typeof UpdateDipReadingSchema>;
export type PaginatedDipReading = z.infer<typeof PaginatedDipReadingSchema>;

// Query parameters for filtering
export interface DipReadingQueryParams {
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
}

export interface TankDipReadingQueryParams extends DipReadingQueryParams {
  tankId: string;
}
