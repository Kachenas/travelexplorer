import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type Accommodation = Database['public']['Tables']['accommodations']['Row']
type Tour = Database['public']['Tables']['tours']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Booking = Database['public']['Tables']['bookings']['Row']

export interface ProfileWithEmail {
  id: string
  full_name: string | null
  avatar_url: string | null
  nationality: string | null
  user_type: string
  is_suspended: boolean
  contact_number: string | null
  identification: string | null
  business_permit: string | null
  document: string | null
  created_at: string
  updated_at: string
  email: string
}

// --- Admin guard ---

export async function isAdmin(client: SupabaseClient<Database>, userId: string): Promise<boolean> {
  const { data } = await client.from('profiles').select('user_type').eq('id', userId).single()

  return data?.user_type === 'admin'
}

// --- Pending listings ---

export async function fetchPendingVehicles(
  client: SupabaseClient<Database>,
): Promise<(Vehicle & { owner_name: string })[]> {
  const { data, error } = await client
    .from('vehicles')
    .select('*, profiles!vehicles_owner_id_fkey(full_name)')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((v: Record<string, unknown>) => {
    const profiles = v.profiles as { full_name: string | null } | null
    const { profiles: _, ...vehicle } = v
    return {
      ...(vehicle as unknown as Vehicle),
      owner_name: profiles?.full_name ?? 'Unknown',
    }
  })
}

export async function fetchPendingAccommodations(
  client: SupabaseClient<Database>,
): Promise<(Accommodation & { owner_name: string })[]> {
  const { data, error } = await client
    .from('accommodations')
    .select('*, profiles!accommodations_owner_id_fkey(full_name)')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((a: Record<string, unknown>) => {
    const profiles = a.profiles as { full_name: string | null } | null
    const { profiles: _, ...accommodation } = a
    return {
      ...(accommodation as unknown as Accommodation),
      owner_name: profiles?.full_name ?? 'Unknown',
    }
  })
}

export async function fetchPendingTours(
  client: SupabaseClient<Database>,
): Promise<(Tour & { owner_name: string })[]> {
  const { data, error } = await client
    .from('tours')
    .select('*, profiles!tours_owner_id_fkey(full_name)')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((t: Record<string, unknown>) => {
    const profiles = t.profiles as { full_name: string | null } | null
    const { profiles: _, ...tour } = t
    return {
      ...(tour as unknown as Tour),
      owner_name: profiles?.full_name ?? 'Unknown',
    }
  })
}

// --- All listings (admin) ---

export async function fetchAllVehicles(
  client: SupabaseClient<Database>,
): Promise<(Vehicle & { owner_name: string })[]> {
  const { data, error } = await client
    .from('vehicles')
    .select('*, profiles!vehicles_owner_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((v: Record<string, unknown>) => {
    const profiles = v.profiles as { full_name: string | null } | null
    const { profiles: _, ...vehicle } = v
    return {
      ...(vehicle as unknown as Vehicle),
      owner_name: profiles?.full_name ?? 'Unknown',
    }
  })
}

export async function fetchAllAccommodations(
  client: SupabaseClient<Database>,
): Promise<(Accommodation & { owner_name: string })[]> {
  const { data, error } = await client
    .from('accommodations')
    .select('*, profiles!accommodations_owner_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((a: Record<string, unknown>) => {
    const profiles = a.profiles as { full_name: string | null } | null
    const { profiles: _, ...accommodation } = a
    return {
      ...(accommodation as unknown as Accommodation),
      owner_name: profiles?.full_name ?? 'Unknown',
    }
  })
}

export async function fetchAllTours(
  client: SupabaseClient<Database>,
): Promise<(Tour & { owner_name: string })[]> {
  const { data, error } = await client
    .from('tours')
    .select('*, profiles!tours_owner_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((t: Record<string, unknown>) => {
    const profiles = t.profiles as { full_name: string | null } | null
    const { profiles: _, ...tour } = t
    return {
      ...(tour as unknown as Tour),
      owner_name: profiles?.full_name ?? 'Unknown',
    }
  })
}

// --- Approve / Reject ---

export async function approveVehicle(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Vehicle> {
  const { data, error } = await client
    .from('vehicles')
    .update({ is_approved: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function rejectVehicle(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Vehicle> {
  const { data, error } = await client
    .from('vehicles')
    .update({ is_approved: false, is_active: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function approveAccommodation(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Accommodation> {
  const { data, error } = await client
    .from('accommodations')
    .update({ is_approved: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function rejectAccommodation(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Accommodation> {
  const { data, error } = await client
    .from('accommodations')
    .update({ is_approved: false, is_active: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function approveTour(client: SupabaseClient<Database>, id: string): Promise<Tour> {
  const { data, error } = await client
    .from('tours')
    .update({ is_approved: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function rejectTour(client: SupabaseClient<Database>, id: string): Promise<Tour> {
  const { data, error } = await client
    .from('tours')
    .update({ is_approved: false, is_active: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// --- Owner management ---

export async function fetchAllOwners(client: SupabaseClient<Database>): Promise<Profile[]> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .in('user_type', ['van_owner', 'hotel_owner', 'tour_operator'])
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function fetchAllProfiles(client: SupabaseClient<Database>): Promise<Profile[]> {
  const { data, error } = await client
    .from('profiles')
    .select(
      'id, full_name, avatar_url, nationality, user_type, is_suspended, contact_number, created_at, updated_at',
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Profile[]
}

// --- Admin user detail (profile + email via RPC) ---

export async function fetchProfileWithEmail(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileWithEmail | null> {
  const { data, error } = await client.rpc('admin_get_profile_with_email', {
    target_user_id: userId,
  })

  if (error) throw new Error(error.message)
  return (data as unknown as ProfileWithEmail) ?? null
}

export async function updateProfileSuspension(
  client: SupabaseClient<Database>,
  userId: string,
  isSuspended: boolean,
): Promise<Profile> {
  const { data, error } = await client
    .from('profiles')
    .update({ is_suspended: isSuspended })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateUserType(
  client: SupabaseClient<Database>,
  userId: string,
  userType: string,
): Promise<Profile> {
  const { data, error } = await client
    .from('profiles')
    .update({ user_type: userType })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// --- Platform stats ---

export async function fetchPlatformStats(client: SupabaseClient<Database>): Promise<{
  totalOwners: number
  totalVehicles: number
  totalAccommodations: number
  totalTours: number
  pendingApprovals: number
  totalBookings: number
  totalRevenue: number
}> {
  const [owners, vehicles, accommodations, tours, bookings] = await Promise.all([
    client
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .in('user_type', ['van_owner', 'hotel_owner', 'tour_operator']),
    client.from('vehicles').select('id, is_approved', { count: 'exact' }),
    client.from('accommodations').select('id, is_approved', { count: 'exact' }),
    client.from('tours').select('id, is_approved', { count: 'exact' }),
    client.from('bookings').select('total_price, status'),
  ])

  const pendingVehicles = (vehicles.data ?? []).filter((v) => !v.is_approved).length
  const pendingAccommodations = (accommodations.data ?? []).filter((a) => !a.is_approved).length
  const pendingTours = (tours.data ?? []).filter((t) => !t.is_approved).length

  const confirmedBookings = (bookings.data ?? []).filter((b) => b.status === 'confirmed')
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.total_price), 0)

  return {
    totalOwners: owners.count ?? 0,
    totalVehicles: vehicles.data?.length ?? 0,
    totalAccommodations: accommodations.data?.length ?? 0,
    totalTours: tours.data?.length ?? 0,
    pendingApprovals: pendingVehicles + pendingAccommodations + pendingTours,
    totalBookings: bookings.data?.length ?? 0,
    totalRevenue,
  }
}
