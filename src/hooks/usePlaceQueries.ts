import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import * as placeService from '@/services/PlaceService'
import type { LoopCategory } from '@/services/PlaceService'

export const placeKeys = {
  all: ['places'] as const,
  list: (loop?: LoopCategory) => ['places', 'list', loop] as const,
  detail: (id: string) => ['places', id] as const,
  byLoop: (loop: LoopCategory) => ['places', 'loop', loop] as const,
}

export function usePlaces(loop?: LoopCategory) {
  const supabase = createClient()
  return useQuery({
    queryKey: placeKeys.list(loop),
    queryFn: () => placeService.fetchPlaces(supabase, loop),
  })
}

export function usePlace(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: placeKeys.detail(id),
    queryFn: () => placeService.fetchPlaceById(supabase, id),
    enabled: !!id,
  })
}

export function usePlacesByLoop(loop: LoopCategory) {
  const supabase = createClient()
  return useQuery({
    queryKey: placeKeys.byLoop(loop),
    queryFn: () => placeService.fetchPlacesByLoop(supabase, loop),
    enabled: !!loop,
  })
}
