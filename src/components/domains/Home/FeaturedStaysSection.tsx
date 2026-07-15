'use client'

import { FeaturedAccommodations } from '@/components/domains/Accommodations/FeaturedAccommodations'
import type { Database } from '@/types/supabase'

type Accommodation = Database['public']['Tables']['accommodations']['Row']

interface FeaturedStaysSectionProps {
  accommodations: Accommodation[]
}

export function FeaturedStaysSection({ accommodations }: FeaturedStaysSectionProps) {
  return <FeaturedAccommodations accommodations={accommodations} />
}
