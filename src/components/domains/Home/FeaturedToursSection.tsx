'use client'

import { FeaturedTours } from '@/components/domains/Tours/FeaturedTours'
import type { Database } from '@/types/supabase'

type Tour = Database['public']['Tables']['tours']['Row']

interface FeaturedToursSectionProps {
  tours: Tour[]
}

export function FeaturedToursSection({ tours }: FeaturedToursSectionProps) {
  return <FeaturedTours tours={tours} />
}
