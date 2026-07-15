import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Place = Database['public']['Tables']['places']['Row']

export type LoopCategory = 'Cordillera' | 'Ilocos' | 'Bicol' | 'Metro Manila'

export async function fetchPlaces(
  client: SupabaseClient<Database>,
  loop?: LoopCategory,
): Promise<Place[]> {
  let query = client.from('places').select('*').order('name', { ascending: true })

  if (loop) {
    query = query.eq('loop_category', loop)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data
}

export async function fetchPlaceById(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Place | null> {
  const { data, error } = await client.from('places').select('*').eq('id', id).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function fetchPlacesByLoop(
  client: SupabaseClient<Database>,
  loop: LoopCategory,
): Promise<Place[]> {
  const { data, error } = await client
    .from('places')
    .select('*')
    .eq('loop_category', loop)
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}
