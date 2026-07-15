import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import * as tourService from '@/services/TourService'
import type { TourFilters } from '@/services/TourService'

export const tourKeys = {
  all: ['tours'] as const,
  list: (filters?: TourFilters) => ['tours', 'list', filters] as const,
  detail: (id: string) => ['tours', id] as const,
  byOwner: (ownerId: string) => ['tours', 'owner', ownerId] as const,
}

export function useTours(filters?: TourFilters) {
  const supabase = createClient()
  return useQuery({
    queryKey: tourKeys.list(filters),
    queryFn: () => tourService.fetchTours(supabase, filters),
  })
}

export function useTour(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: tourKeys.detail(id),
    queryFn: () => tourService.fetchTourById(supabase, id),
    enabled: !!id,
  })
}

export function useMyTours(ownerId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: tourKeys.byOwner(ownerId),
    queryFn: () => tourService.fetchToursByOwner(supabase, ownerId),
    enabled: !!ownerId,
  })
}
