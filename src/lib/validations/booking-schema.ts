import { z } from 'zod'

export const bookingSchema = z
  .object({
    booking_type: z.enum(['van', 'hotel', 'tour', 'bundle']),
    reference_id: z.string().uuid().optional(),
    start_date: z.coerce.date({ message: 'Start date is required' }),
    end_date: z.coerce.date({ message: 'End date is required' }),
    total_price: z.coerce.number().min(0),
    special_requests: z.string().max(1000).optional(),
    bundle_data: z
      .object({
        vehicle_id: z.string().uuid().optional(),
        accommodation_id: z.string().uuid().optional(),
      })
      .optional(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  })

export type BookingFormData = z.infer<typeof bookingSchema>
