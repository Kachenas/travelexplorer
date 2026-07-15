'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { tourSchema } from '@/lib/validations/tour-schema'
import * as tourService from '@/services/TourService'
import type { TourFilters } from '@/services/TourService'

export async function getToursAction(filters?: TourFilters) {
  const supabase = await createClient()
  return tourService.fetchTours(supabase, filters)
}

export async function getTourByIdAction(id: string) {
  const supabase = await createClient()
  return tourService.fetchTourById(supabase, id)
}

export async function getMyToursAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const data = await tourService.fetchToursByOwner(supabase, user.id)
  return { data }
}

export async function createTourAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const raw = {
    name: formData.get('name'),
    location: formData.get('location'),
    duration_hours: formData.get('duration_hours'),
    price_per_person: formData.get('price_per_person'),
    max_group_size: formData.get('max_group_size'),
    inclusions: formData.getAll('inclusions').map(String).filter(Boolean),
    description: formData.get('description') || undefined,
  }

  const result = tourSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const images = formData.getAll('images').map(String).filter(Boolean)

  try {
    const data = await tourService.createTour(supabase, {
      ...result.data,
      owner_id: user.id,
      images: images.length > 0 ? images : undefined,
    })
    revalidatePath('/dashboard/listings')
    revalidatePath('/')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create tour' }
  }
}

export async function updateTourAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const raw = {
    name: formData.get('name'),
    location: formData.get('location'),
    duration_hours: formData.get('duration_hours'),
    price_per_person: formData.get('price_per_person'),
    max_group_size: formData.get('max_group_size'),
    inclusions: formData.getAll('inclusions').map(String).filter(Boolean),
    description: formData.get('description') || undefined,
  }

  const result = tourSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const images = formData.getAll('images').map(String).filter(Boolean)

  try {
    const data = await tourService.updateTour(supabase, id, {
      ...result.data,
      images: images.length > 0 ? images : [],
    })
    revalidatePath('/tours')
    revalidatePath('/')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update tour' }
  }
}

export async function deleteTourAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    await tourService.toggleTourActive(supabase, id, false)
    revalidatePath('/tours')
    revalidatePath('/listings')
    revalidatePath('/')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to deactivate tour' }
  }
}

export async function toggleTourActiveAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const data = await tourService.toggleTourActive(supabase, id, isActive)
    revalidatePath('/tours')
    revalidatePath('/listings')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to toggle tour status' }
  }
}
