import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Accommodation = Database['public']['Tables']['accommodations']['Row']
type AccommodationInsert = Database['public']['Tables']['accommodations']['Insert']
type AccommodationUpdate = Database['public']['Tables']['accommodations']['Update']

export interface AccommodationFilters {
  location?: string
  type?: 'hotel' | 'homestay' | 'resort'
  max_price?: number
  accepts_credit_card?: boolean
}

export async function fetchAccommodations(
  client: SupabaseClient<Database>,
  filters?: AccommodationFilters,
): Promise<Accommodation[]> {
  let query = client
    .from('accommodations')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.max_price) {
    query = query.lte('price_per_night', filters.max_price)
  }
  if (filters?.accepts_credit_card) {
    query = query.eq('accepts_credit_card', true)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}

export async function fetchAccommodationById(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Accommodation | null> {
  const { data, error } = await client.from('accommodations').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function fetchAccommodationsByOwner(
  client: SupabaseClient<Database>,
  ownerId: string,
): Promise<Accommodation[]> {
  const { data, error } = await client
    .from('accommodations')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createAccommodation(
  client: SupabaseClient<Database>,
  payload: AccommodationInsert,
): Promise<Accommodation> {
  const { data, error } = await client.from('accommodations').insert(payload).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateAccommodation(
  client: SupabaseClient<Database>,
  id: string,
  payload: AccommodationUpdate,
): Promise<Accommodation> {
  const { data, error } = await client
    .from('accommodations')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteAccommodation(
  client: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await client.from('accommodations').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

export async function toggleAccommodationActive(
  client: SupabaseClient<Database>,
  id: string,
  isActive: boolean,
): Promise<Accommodation> {
  const { data, error } = await client
    .from('accommodations')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function fetchFeaturedAccommodations(
  client: SupabaseClient<Database>,
  limit = 6,
): Promise<Accommodation[]> {
  const { data, error } = await client
    .from('accommodations')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}
