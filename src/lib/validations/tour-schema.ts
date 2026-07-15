import { z } from 'zod'

export const tourSchema = z.object({
  name: z.string().min(1, 'Tour name is required').max(100),
  location: z.string().min(1, 'Location is required'),
  duration_hours: z.coerce.number().min(0.5, 'Duration must be at least 0.5 hours'),
  price_per_person: z.coerce.number().min(0, 'Price must be positive'),
  max_group_size: z.coerce.number().int().min(1, 'Group size must be at least 1').max(100),
  inclusions: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  description: z.string().max(2000).optional(),
})

export type TourFormData = z.infer<typeof tourSchema>
