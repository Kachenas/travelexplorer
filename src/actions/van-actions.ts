'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { vehicleSchema } from '@/lib/validations/vehicle-schema'
import * as vehicleService from '@/services/VehicleService'
import type { VehicleFilters } from '@/services/VehicleService'

export async function getVansAction(filters?: VehicleFilters) {
  const supabase = await createClient()
  return vehicleService.fetchVehicles(supabase, filters)
}

export async function getVanByIdAction(id: string) {
  const supabase = await createClient()
  return vehicleService.fetchVehicleById(supabase, id)
}

export async function getMyVansAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const data = await vehicleService.fetchVehiclesByOwner(supabase, user.id)
  return { data }
}

export async function createVanAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const raw = {
    name: formData.get('name'),
    capacity: formData.get('capacity'),
    transmission: formData.get('transmission'),
    base_location: formData.get('base_location'),
    daily_rate: formData.get('daily_rate'),
    driver_included: formData.get('driver_included') === 'true',
    inclusions: formData.getAll('inclusions').map(String).filter(Boolean),
    description: formData.get('description') || undefined,
  }

  const result = vehicleSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const images = formData.getAll('images').map(String).filter(Boolean)

  try {
    const data = await vehicleService.createVehicle(supabase, {
      ...result.data,
      owner_id: user.id,
      images: images.length > 0 ? images : undefined,
    })
    revalidatePath('/dashboard/listings')
    revalidatePath('/')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create vehicle' }
  }
}

export async function updateVanAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const raw = {
    name: formData.get('name'),
    capacity: formData.get('capacity'),
    transmission: formData.get('transmission'),
    base_location: formData.get('base_location'),
    daily_rate: formData.get('daily_rate'),
    driver_included: formData.get('driver_included') === 'true',
    inclusions: formData.getAll('inclusions').map(String).filter(Boolean),
    description: formData.get('description') || undefined,
  }

  const result = vehicleSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const images = formData.getAll('images').map(String).filter(Boolean)

  try {
    const data = await vehicleService.updateVehicle(supabase, id, {
      ...result.data,
      images: images.length > 0 ? images : [],
    })
    revalidatePath('/vans')
    revalidatePath('/')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update vehicle' }
  }
}

export async function deleteVanAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    await vehicleService.toggleVehicleActive(supabase, id, false)
    revalidatePath('/vans')
    revalidatePath('/listings')
    revalidatePath('/')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to deactivate vehicle' }
  }
}

export async function toggleVanActiveAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const data = await vehicleService.toggleVehicleActive(supabase, id, isActive)
    revalidatePath('/vans')
    revalidatePath('/listings')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to toggle vehicle status' }
  }
}
