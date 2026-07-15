import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import * as vehicleService from '@/services/VehicleService'
import type { VehicleFilters } from '@/services/VehicleService'

export const vanKeys = {
  all: ['vans'] as const,
  list: (filters?: VehicleFilters) => ['vans', 'list', filters] as const,
  detail: (id: string) => ['vans', id] as const,
  byOwner: (ownerId: string) => ['vans', 'owner', ownerId] as const,
}

export function useVans(filters?: VehicleFilters) {
  const supabase = createClient()
  return useQuery({
    queryKey: vanKeys.list(filters),
    queryFn: () => vehicleService.fetchVehicles(supabase, filters),
  })
}

export function useVan(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: vanKeys.detail(id),
    queryFn: () => vehicleService.fetchVehicleById(supabase, id),
    enabled: !!id,
  })
}

export function useMyVans(ownerId: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: vanKeys.byOwner(ownerId),
    queryFn: () => vehicleService.fetchVehiclesByOwner(supabase, ownerId),
    enabled: !!ownerId,
  })
}
