import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import * as bookingService from '@/services/BookingService'
import * as vehicleService from '@/services/VehicleService'
import * as accommodationService from '@/services/AccommodationService'
import * as tourService from '@/services/TourService'
import * as profileService from '@/services/ProfileService'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await profileService.fetchProfile(supabase, user.id)
  const userType = profile?.user_type ?? 'customer'

  const [vehicles, accommodations, tours, vanBookings, accBookings, tourBookings] =
    await Promise.all([
      vehicleService.fetchVehiclesByOwner(supabase, user.id).catch(() => []),
      accommodationService.fetchAccommodationsByOwner(supabase, user.id).catch(() => []),
      tourService.fetchToursByOwner(supabase, user.id).catch(() => []),
      bookingService.fetchBookingsForOwnerVehicles(supabase, user.id).catch(() => []),
      bookingService.fetchBookingsForOwnerAccommodations(supabase, user.id).catch(() => []),
      bookingService.fetchBookingsForOwnerTours(supabase, user.id).catch(() => []),
    ])

  const allBookings = [...vanBookings, ...accBookings, ...tourBookings]
  const activeBookings = allBookings.filter((b) => b.status !== 'cancelled')
  const totalRevenue = allBookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.total_price), 0)

  const stats: { label: string; value: string; href: string }[] = []

  if (userType === 'van_owner') {
    const activeVans = vehicles.filter((v) => v.is_active)
    stats.push({ label: 'Active Vans', value: String(activeVans.length), href: '/vans' })
  }
  if (userType === 'hotel_owner') {
    const activeAccommodations = accommodations.filter((a) => a.is_active)
    stats.push({
      label: 'Active Stays',
      value: String(activeAccommodations.length),
      href: '/stays',
    })
  }
  if (userType === 'tour_operator') {
    const activeTours = tours.filter((t) => t.is_active)
    stats.push({
      label: 'Active Tours',
      value: String(activeTours.length),
      href: '/tours',
    })
  }

  stats.push(
    { label: 'Total Bookings', value: String(activeBookings.length), href: '/bookings' },
    {
      label: 'Revenue',
      value: `PHP ${totalRevenue.toLocaleString()}`,
      href: '/bookings',
    },
  )

  return (
    <div>
      <div className="mb-10">
        <p className="text-primary text-sm font-medium">Dashboard</p>
        <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          Overview
        </h1>
        <p className="text-ink-secondary mt-2 text-base sm:text-lg">
          Welcome back, {profile?.full_name || user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-surface shadow-card hover:shadow-card-hover rounded-[var(--radius-card)] p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="text-primary font-[family-name:var(--font-display)] text-4xl font-bold">
              {stat.value}
            </span>
            <p className="text-ink-secondary mt-2 text-sm font-medium">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-14">
        <h2 className="text-ink-tertiary text-sm font-medium">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {userType === 'van_owner' && (
            <Link
              href="/vans"
              className="bg-primary hover:bg-primary-hover hover:shadow-glow rounded-[var(--radius-button)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300"
            >
              Manage Vans
            </Link>
          )}
          {userType === 'hotel_owner' && (
            <Link
              href="/stays"
              className="bg-primary hover:bg-primary-hover hover:shadow-glow rounded-[var(--radius-button)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300"
            >
              Manage Stays
            </Link>
          )}
          {userType === 'tour_operator' && (
            <Link
              href="/tours"
              className="bg-primary hover:bg-primary-hover hover:shadow-glow rounded-[var(--radius-button)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300"
            >
              Manage Tours
            </Link>
          )}
          <Link
            href="/bookings"
            className="border-border bg-surface text-ink hover:border-primary hover:text-primary rounded-[var(--radius-button)] border px-6 py-3 text-sm font-semibold transition-colors duration-300"
          >
            View Bookings
          </Link>
          <Link
            href="/"
            className="border-border bg-surface text-ink hover:border-primary hover:text-primary rounded-[var(--radius-button)] border px-6 py-3 text-sm font-semibold transition-colors duration-300"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  )
}
