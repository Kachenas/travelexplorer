'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { onboardingProfileSchema } from '@/lib/validations/profile-schema'
import * as profileService from '@/services/ProfileService'

const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const DOCUMENT_FIELDS = ['identification', 'business_permit', 'document'] as const

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

export async function uploadDocumentsAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const updates: Record<string, string> = {}

  for (const field of DOCUMENT_FIELDS) {
    const file = formData.get(field)
    if (!file || !(file instanceof File) || file.size === 0) continue

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: `${field}: only JPG, JPEG, and PNG images are accepted` }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: `${field}: file exceeds 10 MB limit` }
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const path = `${user.id}/${field}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('owner-documents')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      return { error: `Failed to upload ${field}: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('owner-documents').getPublicUrl(path)

    updates[field] = publicUrl
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No files provided' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('profiles') as any)
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/onboarding')
  return {}
}
