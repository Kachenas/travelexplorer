import { z } from 'zod'

export const vehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required').max(100),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').max(30),
  transmission: z.enum(['auto', 'manual']),
  base_location: z.string().min(1, 'Base location is required'),
  daily_rate: z.coerce.number().min(0, 'Daily rate must be positive'),
  driver_included: z.boolean().default(true),
  inclusions: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  description: z.string().max(2000).optional(),
})

export type VehicleFormData = z.infer<typeof vehicleSchema>
