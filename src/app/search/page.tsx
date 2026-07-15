import { createClient } from '@/lib/supabase/server'
import * as vehicleService from '@/services/VehicleService'
import * as accommodationService from '@/services/AccommodationService'
import * as tourService from '@/services/TourService'
import { Navbar } from '@/components/ui/Navbar'
import { SearchSidebar } from '@/components/domains/Search/SearchSidebar'
import { SearchResults } from '@/components/domains/Search/SearchResults'

interface SearchPageProps {
  searchParams: Promise<{
    loop?: string
    passengers?: string
    start?: string
    end?: string
    location?: string
    type?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const vehicleFilters = {
    base_location: params.location,
    min_capacity: params.passengers ? Number(params.passengers) : undefined,
  }

  const accommodationFilters = {
    location: params.location,
  }

  const tourFilters = {
    location: params.location,
  }

  const showVans = !params.type || params.type === 'van'
  const showAccommodations = !params.type || params.type === 'hotel'
  const showTours = !params.type || params.type === 'tour'

  const [vehicles, accommodations, tours] = await Promise.all([
    showVans
      ? vehicleService.fetchVehicles(supabase, vehicleFilters).catch((err) => {
          console.error('[search] vehicles error:', err)
          return []
        })
      : [],
    showAccommodations
      ? accommodationService.fetchAccommodations(supabase, accommodationFilters).catch((err) => {
          console.error('[search] accommodations error:', err)
          return []
        })
      : [],
    showTours
      ? tourService.fetchTours(supabase, tourFilters).catch((err) => {
          console.error('[search] tours error:', err)
          return []
        })
      : [],
  ])

  const totalCount = vehicles.length + accommodations.length + tours.length

  return (
    <div className="bg-page min-h-screen">
      <Navbar user={user} />

      <div className="pt-[68px]">
        {/* Page header */}
        <div className="border-border bg-surface border-b px-6 py-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-primary text-sm font-medium">
              {params.loop ? `${params.loop} Loop` : 'All Regions'}
            </p>
            <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
              Search Results
            </h1>
            <p className="text-ink-secondary mt-2 text-base sm:text-lg">
              {totalCount} listing{totalCount !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Sidebar + Results */}
        <div className="mx-auto flex max-w-7xl">
          {/* Sidebar */}
          <aside className="border-border bg-surface hidden w-72 flex-shrink-0 border-r lg:block">
            <SearchSidebar currentType={params.type} currentLoop={params.loop} />
          </aside>

          {/* Results */}
          <main className="min-w-0 flex-1 px-6 py-10">
            <SearchResults
              vehicles={vehicles}
              accommodations={accommodations}
              tours={tours}
              showVans={showVans}
              showAccommodations={showAccommodations}
              showTours={showTours}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
