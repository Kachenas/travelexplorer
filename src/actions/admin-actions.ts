'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import * as adminService from '@/services/AdminService'
import * as vehicleService from '@/services/VehicleService'
import * as accommodationService from '@/services/AccommodationService'
import * as tourService from '@/services/TourService'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase: null, error: 'Not authenticated' }

  const admin = await adminService.isAdmin(supabase, user.id)
  if (!admin) return { supabase: null, error: 'Unauthorized' }

  return { supabase, error: null }
}

// --- Pending listings ---

export async function getPendingListingsAction() {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const [vehicles, accommodations, tours] = await Promise.all([
      adminService.fetchPendingVehicles(supabase),
      adminService.fetchPendingAccommodations(supabase),
      adminService.fetchPendingTours(supabase),
    ])

    return { data: { vehicles, accommodations, tours } }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch pending listings' }
  }
}

// --- Approve / Reject ---

export async function approveListingAction(type: 'vehicle' | 'accommodation' | 'tour', id: string) {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    if (type === 'vehicle') {
      await adminService.approveVehicle(supabase, id)
    } else if (type === 'accommodation') {
      await adminService.approveAccommodation(supabase, id)
    } else {
      await adminService.approveTour(supabase, id)
    }

    revalidatePath('/admin/approvals')
    revalidatePath('/admin')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to approve listing' }
  }
}

export async function rejectListingAction(type: 'vehicle' | 'accommodation' | 'tour', id: string) {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    if (type === 'vehicle') {
      await adminService.rejectVehicle(supabase, id)
    } else if (type === 'accommodation') {
      await adminService.rejectAccommodation(supabase, id)
    } else {
      await adminService.rejectTour(supabase, id)
    }

    revalidatePath('/admin/approvals')
    revalidatePath('/admin')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to reject listing' }
  }
}

// --- Owner management ---

export async function getOwnersAction() {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const data = await adminService.fetchAllOwners(supabase)
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch owners' }
  }
}

export async function getAllUsersAction() {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const data = await adminService.fetchAllProfiles(supabase)
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch users' }
  }
}

export async function updateUserTypeAction(userId: string, userType: string) {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  const validTypes = ['customer', 'van_owner', 'hotel_owner', 'tour_operator', 'admin']
  if (!validTypes.includes(userType)) {
    return { error: 'Invalid user type' }
  }

  try {
    const data = await adminService.updateUserType(supabase, userId, userType)
    revalidatePath('/admin/owners')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update user type' }
  }
}

// --- User detail ---

export async function getUserDetailAction(userId: string) {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const data = await adminService.fetchProfileWithEmail(supabase, userId)
    if (!data) return { error: 'User not found' }
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch user detail' }
  }
}

export async function toggleSuspendUserAction(userId: string, isSuspended: boolean) {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    await adminService.updateProfileSuspension(supabase, userId, isSuspended)
    revalidatePath('/admin/owners')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update suspension' }
  }
}

// --- All listings (admin) ---

export async function getAllVehiclesAction() {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const data = await adminService.fetchAllVehicles(supabase)
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch vehicles' }
  }
}

export async function getAllAccommodationsAction() {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const data = await adminService.fetchAllAccommodations(supabase)
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch accommodations' }
  }
}

export async function getAllToursAction() {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const data = await adminService.fetchAllTours(supabase)
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch tours' }
  }
}

export async function adminToggleListingActiveAction(
  type: 'vehicle' | 'accommodation' | 'tour',
  id: string,
  isActive: boolean,
) {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    if (type === 'vehicle') {
      await vehicleService.toggleVehicleActive(supabase, id, isActive)
    } else if (type === 'accommodation') {
      await accommodationService.toggleAccommodationActive(supabase, id, isActive)
    } else {
      await tourService.toggleTourActive(supabase, id, isActive)
    }

    revalidatePath(`/admin/${type}s`)
    revalidatePath('/admin')
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to toggle listing status' }
  }
}

// --- Platform stats ---

export async function getPlatformStatsAction() {
  const { supabase, error } = await requireAdmin()
  if (error || !supabase) return { error: error ?? 'Unauthorized' }

  try {
    const data = await adminService.fetchPlatformStats(supabase)
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch stats' }
  }
}
