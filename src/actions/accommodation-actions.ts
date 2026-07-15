'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { accommodationSchema } from '@/lib/validations/accommodation-schema'
import * as accommodationService from '@/services/AccommodationService'
import type { AccommodationFilters } from '@/services/AccommodationService'

export async function getAccommodationsAction(filters?: AccommodationFilters) {
  const supabase = await createClient()
  return accommodationService.fetchAccommodations(supabase, filters)
}

export async function getAccommodationByIdAction(id: string) {
  const supabase = await createClient()
  return accommodationService.fetchAccommodationById(supabase, id)
}

export async function getMyAccommodationsAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const data = await accommodationService.fetchAccommodationsByOwner(supabase, user.id)
  return { data }
}

export async function createAccommodationAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const raw = {
    name: formData.get('name'),
    type: formData.get('type'),
    location: formData.get('location'),
    price_per_night: formData.get('price_per_night'),
    amenities: formData.getAll('amenities').map(String).filter(Boolean),
    accepts_credit_card: formData.get('accepts_credit_card') === 'true',
    description: formData.get('description') || undefined,
  }

  const result = accommodationSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const images = formData.getAll('images').map(String).filter(Boolean)

  try {
    const data = await accommodationService.createAccommodation(supabase, {
      ...result.data,
      owner_id: user.id,
      images: images.length > 0 ? images : undefined,
    })
    revalidatePath('/dashboard/listings')
    revalidatePath('/')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create accommodation' }
  }
}

export async function updateAccommodationAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const raw = {
    name: formData.get('name'),
    type: formData.get('type'),
    location: formData.get('location'),
    price_per_night: formData.get('price_per_night'),
    amenities: formData.getAll('amenities').map(String).filter(Boolean),
    accepts_credit_card: formData.get('accepts_credit_card') === 'true',
    description: formData.get('description') || undefined,
  }

  const result = accommodationSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const images = formData.getAll('images').map(String).filter(Boolean)

  try {
    const data = await accommodationService.updateAccommodation(supabase, id, {
      ...result.data,
      images: images.length > 0 ? images : [],
    })
    revalidatePath('/stays')
    revalidatePath('/')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update accommodation' }
  }
}

export async function deleteAccommodationAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    await accommodationService.toggleAccommodationActive(supabase, id, false)
    revalidatePath('/stays')
    revalidatePath('/listings')
    revalidatePath('/')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to deactivate accommodation' }
  }
}

export async function toggleAccommodationActiveAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const data = await accommodationService.toggleAccommodationActive(supabase, id, isActive)
    revalidatePath('/stays')
    revalidatePath('/listings')
    return { data }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to toggle accommodation status',
    }
  }
}
