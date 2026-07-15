import { z } from 'zod'

export const onboardingProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  user_type: z.enum(['van_owner', 'hotel_owner', 'tour_operator']),
  nationality: z.string().optional(),
  contact_number: z.string().optional(),
})

export type OnboardingProfileFormData = z.infer<typeof onboardingProfileSchema>
