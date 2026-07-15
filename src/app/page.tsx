import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import * as vehicleService from '@/services/VehicleService'
import * as accommodationService from '@/services/AccommodationService'
import * as tourService from '@/services/TourService'
import { Navbar } from '@/components/ui/Navbar'
import { HeroSection } from '@/components/domains/Home/HeroSection'
import { LoopsGrid } from '@/components/domains/Home/LoopsGrid'
import { FeaturedVansSection } from '@/components/domains/Home/FeaturedVansSection'
import { FeaturedStaysSection } from '@/components/domains/Home/FeaturedStaysSection'
import { FeaturedToursSection } from '@/components/domains/Home/FeaturedToursSection'
import { RevealSection } from '@/components/ui/RevealSection'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [featuredVans, featuredAccommodations, featuredTours] = await Promise.all([
    vehicleService.fetchFeaturedVehicles(supabase, 6).catch(() => []),
    accommodationService.fetchFeaturedAccommodations(supabase, 6).catch(() => []),
    tourService.fetchFeaturedTours(supabase, 6).catch(() => []),
  ])

  return (
    <div className="bg-page min-h-screen">
      <Navbar user={user} />

      <HeroSection />

      {/* Explore by Loop */}
      <section className="bg-surface-alt">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <RevealSection>
            <p className="text-primary text-sm font-medium">Travel Routes</p>
            <h2 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
              Explore by Loop
            </h2>
            <p className="text-ink-secondary mt-3 max-w-lg text-base leading-relaxed sm:text-lg">
              Choose a travel corridor and discover destinations along the way
            </p>
          </RevealSection>
          <div className="mt-10">
            <LoopsGrid />
          </div>
        </div>
      </section>

      {/* Featured Vans */}
      {featuredVans.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <RevealSection>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-primary text-sm font-medium">Transport</p>
                <h2 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
                  Featured Vans
                </h2>
              </div>
              <Link
                href="/search?type=van"
                className="text-primary hidden text-sm font-medium hover:underline sm:block"
              >
                View all
              </Link>
            </div>
          </RevealSection>
          <div className="mt-10">
            <FeaturedVansSection vehicles={featuredVans} />
          </div>
        </section>
      )}

      {/* Featured Accommodations */}
      {featuredAccommodations.length > 0 && (
        <section className="bg-surface-alt">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
            <RevealSection>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-primary text-sm font-medium">Places to Stay</p>
                  <h2 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
                    Featured Stays
                  </h2>
                </div>
                <Link
                  href="/search?type=hotel"
                  className="text-primary hidden text-sm font-medium hover:underline sm:block"
                >
                  View all
                </Link>
              </div>
            </RevealSection>
            <div className="mt-10">
              <FeaturedStaysSection accommodations={featuredAccommodations} />
            </div>
          </div>
        </section>
      )}

      {/* Featured Tours */}
      {featuredTours.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <RevealSection>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-primary text-sm font-medium">Experiences</p>
                <h2 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
                  Featured Tours
                </h2>
              </div>
              <Link
                href="/search?type=tour"
                className="text-primary hidden text-sm font-medium hover:underline sm:block"
              >
                View all
              </Link>
            </div>
          </RevealSection>
          <div className="mt-10">
            <FeaturedToursSection tours={featuredTours} />
          </div>
        </section>
      )}

      {/* Empty State CTA */}
      {featuredVans.length === 0 && featuredAccommodations.length === 0 && featuredTours.length === 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 text-center sm:py-28">
          <RevealSection>
            <h2 className="text-ink font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">
              Coming Soon
            </h2>
            <p className="text-ink-secondary mx-auto mt-4 max-w-md text-base leading-relaxed sm:text-lg">
              We&apos;re curating the best vans and accommodations across Luzon.
            </p>
            {!user && (
              <Link
                href="/register"
                className="bg-primary hover:bg-primary-hover hover:shadow-glow mt-8 inline-block rounded-[var(--radius-button)] px-8 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-300"
              >
                Create an Account
              </Link>
            )}
          </RevealSection>
        </section>
      )}

      {/* Footer */}
      <footer className="border-border bg-surface border-t">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
              Luzon Explore
            </span>
            <p className="text-ink-tertiary text-sm">
              &copy; {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
