'use server'

import { createClient } from '@/lib/supabase/server'
import * as placeService from '@/services/PlaceService'
import type { LoopCategory } from '@/services/PlaceService'

export async function getPlacesAction(loop?: LoopCategory) {
  const supabase = await createClient()
  return placeService.fetchPlaces(supabase, loop)
}

export async function getPlaceByIdAction(id: string) {
  const supabase = await createClient()
  return placeService.fetchPlaceById(supabase, id)
}

export async function getPlacesByLoopAction(loop: LoopCategory) {
  const supabase = await createClient()
  return placeService.fetchPlacesByLoop(supabase, loop)
}
