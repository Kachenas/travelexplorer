import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Tour = Database['public']['Tables']['tours']['Row']
type TourInsert = Database['public']['Tables']['tours']['Insert']
type TourUpdate = Database['public']['Tables']['tours']['Update']

export interface TourFilters {
  location?: string
  max_price?: number
  min_group_size?: number
}

export async function fetchTours(
  client: SupabaseClient<Database>,
  filters?: TourFilters,
): Promise<Tour[]> {
  let query = client
    .from('tours')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  if (filters?.max_price) {
    query = query.lte('price_per_person', filters.max_price)
  }
  if (filters?.min_group_size) {
    query = query.gte('max_group_size', filters.min_group_size)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}

export async function fetchTourById(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Tour | null> {
  const { data, error } = await client.from('tours').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function fetchToursByOwner(
  client: SupabaseClient<Database>,
  ownerId: string,
): Promise<Tour[]> {
  const { data, error } = await client
    .from('tours')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createTour(
  client: SupabaseClient<Database>,
  payload: TourInsert,
): Promise<Tour> {
  const { data, error } = await client.from('tours').insert(payload).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateTour(
  client: SupabaseClient<Database>,
  id: string,
  payload: TourUpdate,
): Promise<Tour> {
  const { data, error } = await client.from('tours').update(payload).eq('id', id).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteTour(client: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await client.from('tours').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

export async function toggleTourActive(
  client: SupabaseClient<Database>,
  id: string,
  isActive: boolean,
): Promise<Tour> {
  const { data, error } = await client
    .from('tours')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function fetchFeaturedTours(
  client: SupabaseClient<Database>,
  limit = 6,
): Promise<Tour[]> {
  const { data, error } = await client
    .from('tours')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}
