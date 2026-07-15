import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import * as profileService from '@/services/ProfileService'

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => ['profiles', userId] as const,
}

export function useProfile(userId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => profileService.fetchProfile(supabase, userId),
    enabled: !!userId,
  })
}
