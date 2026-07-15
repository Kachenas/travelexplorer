import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import * as bookingService from '@/services/BookingService'

export const bookingKeys = {
  all: ['bookings'] as const,
  byUser: (userId: string) => ['bookings', 'user', userId] as const,
  detail: (id: string) => ['bookings', id] as const,
}

export function useBookings(userId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: bookingKeys.byUser(userId),
    queryFn: () => bookingService.fetchBookingsByUser(supabase, userId),
    enabled: !!userId,
  })
}

export function useBooking(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.fetchBookingById(supabase, id),
    enabled: !!id,
  })
}
