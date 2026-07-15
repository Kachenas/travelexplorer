import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import * as accommodationService from '@/services/AccommodationService'
import type { AccommodationFilters } from '@/services/AccommodationService'

export const accommodationKeys = {
  all: ['accommodations'] as const,
  list: (filters?: AccommodationFilters) => ['accommodations', 'list', filters] as const,
  detail: (id: string) => ['accommodations', id] as const,
  byOwner: (ownerId: string) => ['accommodations', 'owner', ownerId] as const,
}

export function useAccommodations(filters?: AccommodationFilters) {
  const supabase = createClient()
  return useQuery({
    queryKey: accommodationKeys.list(filters),
    queryFn: () => accommodationService.fetchAccommodations(supabase, filters),
  })
}

export function useAccommodation(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: accommodationKeys.detail(id),
    queryFn: () => accommodationService.fetchAccommodationById(supabase, id),
    enabled: !!id,
  })
}

export function useMyAccommodations(ownerId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: accommodationKeys.byOwner(ownerId),
    queryFn: () => accommodationService.fetchAccommodationsByOwner(supabase, ownerId),
    enabled: !!ownerId,
  })
}
