'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bookingSchema } from '@/lib/validations/booking-schema'
import * as bookingService from '@/services/BookingService'

export async function getMyBookingsAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const data = await bookingService.fetchBookingsByUser(supabase, user.id)
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch bookings' }
  }
}

export async function getOwnerBookingsAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const [vanBookings, accBookings, tourBookings] = await Promise.all([
      bookingService.fetchBookingsForOwnerVehicles(supabase, user.id).catch(() => []),
      bookingService.fetchBookingsForOwnerAccommodations(supabase, user.id).catch(() => []),
      bookingService.fetchBookingsForOwnerTours(supabase, user.id).catch(() => []),
    ])

    const data = [...vanBookings, ...accBookings, ...tourBookings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to fetch owner bookings' }
  }
}

export async function createBookingAction(payload: {
  booking_type: 'van' | 'hotel' | 'tour' | 'bundle'
  reference_id?: string
  start_date: string
  end_date: string
  total_price: number
  special_requests?: string
  bundle_data?: { vehicle_id?: string; accommodation_id?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const result = bookingSchema.safeParse(payload)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  if (payload.reference_id) {
    const hasConflict = await bookingService.checkBookingConflict(
      supabase,
      payload.reference_id,
      payload.start_date,
      payload.end_date,
    )
    if (hasConflict) {
      return { error: 'This listing is already booked for the selected dates' }
    }
  }

  try {
    const data = await bookingService.createBooking(supabase, {
      user_id: user.id,
      booking_type: payload.booking_type,
      reference_id: payload.reference_id ?? null,
      start_date: payload.start_date,
      end_date: payload.end_date,
      total_price: payload.total_price,
      special_requests: payload.special_requests ?? null,
      bundle_data: payload.bundle_data ?? null,
      status: 'pending',
    })
    revalidatePath('/bookings')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create booking' }
  }
}

export async function cancelBookingAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const data = await bookingService.cancelBooking(supabase, id)
    revalidatePath('/bookings')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to cancel booking' }
  }
}

export async function updateBookingStatusAction(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled',
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  try {
    const data = await bookingService.updateBookingStatus(supabase, id, status)
    revalidatePath('/bookings')
    return { data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update booking status' }
  }
}
