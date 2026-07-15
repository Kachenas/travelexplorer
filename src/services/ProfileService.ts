import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function fetchProfile(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function updateProfile(
  client: SupabaseClient<Database>,
  userId: string,
  payload: ProfileUpdate,
): Promise<Profile> {
  const { data, error } = await client
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
