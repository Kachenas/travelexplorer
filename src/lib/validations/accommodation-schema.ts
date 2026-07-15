import { z } from 'zod'

export const accommodationSchema = z.object({
  name: z.string().min(1, 'Accommodation name is required').max(100),
  type: z.enum(['hotel', 'homestay', 'resort']),
  location: z.string().min(1, 'Location is required'),
  price_per_night: z.coerce.number().min(0, 'Price must be positive'),
  amenities: z.array(z.string()).default([]),
  accepts_credit_card: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
  description: z.string().max(2000).optional(),
})

export type AccommodationFormData = z.infer<typeof accommodationSchema>
