'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { onboardingProfileSchema } from '@/lib/validations/profile-schema'
import * as profileService from '@/services/ProfileService'

export async function getProfileAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const data = await profileService.fetchProfile(supabase, user.id)
  return { data }
}

export async function updateProfileAction(payload: {
  full_name?: string
  nationality?: string
  avatar_url?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const data = await profileService.updateProfile(supabase, user.id, payload)
    revalidatePath('/dashboard')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update profile' }
  }
}

export async function completeOnboardingAction(payload: {
  full_name: string
  user_type: string
  nationality?: string
  contact_number?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const result = onboardingProfileSchema.safeParse(payload)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    await profileService.updateProfile(supabase, user.id, {
      full_name: result.data.full_name,
      user_type: result.data.user_type,
      nationality: result.data.nationality,
      contact_number: result.data.contact_number,
    })
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to complete onboarding' }
  }
}
