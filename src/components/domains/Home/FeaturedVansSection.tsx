'use client'

import { FeaturedVans } from '@/components/domains/Vehicles/FeaturedVans'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']

interface FeaturedVansSectionProps {
  vehicles: Vehicle[]
}

export function FeaturedVansSection({ vehicles }: FeaturedVansSectionProps) {
  return <FeaturedVans vehicles={vehicles} />
}
