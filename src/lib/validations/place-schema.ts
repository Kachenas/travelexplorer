import { z } from 'zod'

export const loopCategories = ['Cordillera', 'Ilocos', 'Bicol', 'Metro Manila'] as const
export type LoopCategory = (typeof loopCategories)[number]

export const placeSchema = z.object({
  name: z.string().min(1, 'Place name is required').max(100),
  loop_category: z.enum(loopCategories),
  city_province: z.string().min(1, 'City/province is required'),
  entrance_fee_foreigner: z.coerce.number().min(0).default(0),
  entrance_fee_local: z.coerce.number().min(0).default(0),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  description: z.string().max(2000).optional(),
  image_url: z.string().url().optional(),
})

export type PlaceFormData = z.infer<typeof placeSchema>
