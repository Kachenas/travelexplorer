'use client'

import { FeaturedVans } from '@/components/domains/Vehicles/FeaturedVans'
import { FeaturedAccommodations } from '@/components/domains/Accommodations/FeaturedAccommodations'
import { FeaturedTours } from '@/components/domains/Tours/FeaturedTours'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type Accommodation = Database['public']['Tables']['accommodations']['Row']
type Tour = Database['public']['Tables']['tours']['Row']

interface SearchResultsProps {
  vehicles: Vehicle[]
  accommodations: Accommodation[]
  tours: Tour[]
  showVans: boolean
  showAccommodations: boolean
  showTours: boolean
}

export function SearchResults({
  vehicles,
  accommodations,
  tours,
  showVans,
  showAccommodations,
  showTours,
}: SearchResultsProps) {
  return (
    <div className="space-y-16">
      {showVans && (
        <section>
          <div className="border-border flex items-end justify-between border-b pb-4">
            <h2 className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
              Van Rentals
            </h2>
            <span className="text-ink-tertiary text-sm">
              {vehicles.length} result{vehicles.length !== 1 ? 's' : ''}
            </span>
          </div>
          {vehicles.length > 0 ? (
            <div className="mt-8">
              <FeaturedVans vehicles={vehicles} />
            </div>
          ) : (
            <p className="text-ink-tertiary mt-8 text-base">
              No van rentals found matching your criteria
            </p>
          )}
        </section>
      )}

      {showAccommodations && (
        <section>
          <div className="border-border flex items-end justify-between border-b pb-4">
            <h2 className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
              Accommodations
            </h2>
            <span className="text-ink-tertiary text-sm">
              {accommodations.length} result{accommodations.length !== 1 ? 's' : ''}
            </span>
          </div>
          {accommodations.length > 0 ? (
            <div className="mt-8">
              <FeaturedAccommodations accommodations={accommodations} />
            </div>
          ) : (
            <p className="text-ink-tertiary mt-8 text-base">
              No accommodations found matching your criteria
            </p>
          )}
        </section>
      )}

      {showTours && (
        <section>
          <div className="border-border flex items-end justify-between border-b pb-4">
            <h2 className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
              Tours
            </h2>
            <span className="text-ink-tertiary text-sm">
              {tours.length} result{tours.length !== 1 ? 's' : ''}
            </span>
          </div>
          {tours.length > 0 ? (
            <div className="mt-8">
              <FeaturedTours tours={tours} />
            </div>
          ) : (
            <p className="text-ink-tertiary mt-8 text-base">
              No tours found matching your criteria
            </p>
          )}
        </section>
      )}
    </div>
  )
}
