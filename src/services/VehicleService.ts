import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']

export interface VehicleFilters {
  base_location?: string
  min_capacity?: number
  max_daily_rate?: number
  transmission?: 'auto' | 'manual'
}

export async function fetchVehicles(
  client: SupabaseClient<Database>,
  filters?: VehicleFilters,
): Promise<Vehicle[]> {
  let query = client
    .from('vehicles')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.base_location) {
    query = query.ilike('base_location', `%${filters.base_location}%`)
  }
  if (filters?.min_capacity) {
    query = query.gte('capacity', filters.min_capacity)
  }
  if (filters?.max_daily_rate) {
    query = query.lte('daily_rate', filters.max_daily_rate)
  }
  if (filters?.transmission) {
    query = query.eq('transmission', filters.transmission)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}

export async function fetchVehicleById(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Vehicle | null> {
  const { data, error } = await client.from('vehicles').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function fetchVehiclesByOwner(
  client: SupabaseClient<Database>,
  ownerId: string,
): Promise<Vehicle[]> {
  const { data, error } = await client
    .from('vehicles')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createVehicle(
  client: SupabaseClient<Database>,
  payload: VehicleInsert,
): Promise<Vehicle> {
  const { data, error } = await client.from('vehicles').insert(payload).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateVehicle(
  client: SupabaseClient<Database>,
  id: string,
  payload: VehicleUpdate,
): Promise<Vehicle> {
  const { data, error } = await client
    .from('vehicles')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteVehicle(client: SupabaseClient<Database>, id: string): Promise<void> {
  const { error } = await client.from('vehicles').delete().eq('id', id)

  if (error) throw new Error(error.message)
}

export async function toggleVehicleActive(
  client: SupabaseClient<Database>,
  id: string,
  isActive: boolean,
): Promise<Vehicle> {
  const { data, error } = await client
    .from('vehicles')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function fetchFeaturedVehicles(
  client: SupabaseClient<Database>,
  limit = 6,
): Promise<Vehicle[]> {
  const { data, error } = await client
    .from('vehicles')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}
