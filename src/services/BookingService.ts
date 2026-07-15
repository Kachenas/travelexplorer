import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']

export async function fetchBookingsByUser(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Booking[]> {
  const { data, error } = await client
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function fetchBookingById(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Booking | null> {
  const { data, error } = await client.from('bookings').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function createBooking(
  client: SupabaseClient<Database>,
  payload: BookingInsert,
): Promise<Booking> {
  const { data, error } = await client.from('bookings').insert(payload).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function cancelBooking(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Booking> {
  const { data, error } = await client
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBookingStatus(
  client: SupabaseClient<Database>,
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled',
): Promise<Booking> {
  const { data, error } = await client
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function checkBookingConflict(
  client: SupabaseClient<Database>,
  referenceId: string,
  startDate: string,
  endDate: string,
): Promise<boolean> {
  const { data, error } = await client
    .from('bookings')
    .select('id')
    .eq('reference_id', referenceId)
    .neq('status', 'cancelled')
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .limit(1)

  if (error) throw new Error(error.message)
  return data.length > 0
}

export async function fetchBookingsForOwnerVehicles(
  client: SupabaseClient<Database>,
  ownerId: string,
): Promise<(Booking & { listing_name: string; customer_name: string })[]> {
  const { data: vehicles } = await client
    .from('vehicles')
    .select('id, name')
    .eq('owner_id', ownerId)

  if (!vehicles || vehicles.length === 0) return []

  const vehicleIds = vehicles.map((v) => v.id)
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v.name]))

  const { data: bookings, error } = await client
    .from('bookings')
    .select('*')
    .eq('booking_type', 'van')
    .in('reference_id', vehicleIds)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const userIds = [...new Set(bookings.map((b) => b.user_id))]
  const { data: profiles } = await client.from('profiles').select('id, full_name').in('id', userIds)

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? 'Unknown']),
  )

  return bookings.map((b) => ({
    ...b,
    listing_name: vehicleMap[b.reference_id ?? ''] ?? 'Unknown',
    customer_name: profileMap[b.user_id] ?? 'Unknown',
  }))
}

export async function fetchBookingsForOwnerAccommodations(
  client: SupabaseClient<Database>,
  ownerId: string,
): Promise<(Booking & { listing_name: string; customer_name: string })[]> {
  const { data: accommodations } = await client
    .from('accommodations')
    .select('id, name')
    .eq('owner_id', ownerId)

  if (!accommodations || accommodations.length === 0) return []

  const accIds = accommodations.map((a) => a.id)
  const accMap = Object.fromEntries(accommodations.map((a) => [a.id, a.name]))

  const { data: bookings, error } = await client
    .from('bookings')
    .select('*')
    .eq('booking_type', 'hotel')
    .in('reference_id', accIds)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const userIds = [...new Set(bookings.map((b) => b.user_id))]
  const { data: profiles } = await client.from('profiles').select('id, full_name').in('id', userIds)

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? 'Unknown']),
  )

  return bookings.map((b) => ({
    ...b,
    listing_name: accMap[b.reference_id ?? ''] ?? 'Unknown',
    customer_name: profileMap[b.user_id] ?? 'Unknown',
  }))
}

export async function fetchBookingsForOwnerTours(
  client: SupabaseClient<Database>,
  ownerId: string,
): Promise<(Booking & { listing_name: string; customer_name: string })[]> {
  const { data: tours } = await client.from('tours').select('id, name').eq('owner_id', ownerId)

  if (!tours || tours.length === 0) return []

  const tourIds = tours.map((t) => t.id)
  const tourMap = Object.fromEntries(tours.map((t) => [t.id, t.name]))

  const { data: bookings, error } = await client
    .from('bookings')
    .select('*')
    .eq('booking_type', 'tour')
    .in('reference_id', tourIds)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const userIds = [...new Set(bookings.map((b) => b.user_id))]
  const { data: profiles } = await client.from('profiles').select('id, full_name').in('id', userIds)

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? 'Unknown']),
  )

  return bookings.map((b) => ({
    ...b,
    listing_name: tourMap[b.reference_id ?? ''] ?? 'Unknown',
    customer_name: profileMap[b.user_id] ?? 'Unknown',
  }))
}
