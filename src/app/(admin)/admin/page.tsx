import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import * as adminService from '@/services/AdminService'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const stats = await adminService.fetchPlatformStats(supabase)

  const cards: { label: string; value: string; href: string }[] = [
    { label: 'Pending Approvals', value: String(stats.pendingApprovals), href: '/admin/approvals' },
    { label: 'Total Owners', value: String(stats.totalOwners), href: '/admin/owners' },
    { label: 'Vehicles', value: String(stats.totalVehicles), href: '/admin/vehicles' },
    {
      label: 'Accommodations',
      value: String(stats.totalAccommodations),
      href: '/admin/accommodations',
    },
    { label: 'Tours', value: String(stats.totalTours), href: '/admin/tours' },
    { label: 'Total Bookings', value: String(stats.totalBookings), href: '/admin' },
    {
      label: 'Revenue',
      value: `PHP ${stats.totalRevenue.toLocaleString()}`,
      href: '/admin',
    },
  ]

  return (
    <div>
      <div className="mb-10">
        <p className="text-primary text-sm font-medium">Admin</p>
        <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          Platform Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group bg-surface shadow-card hover:shadow-card-hover rounded-[var(--radius-card)] p-8 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="text-primary font-[family-name:var(--font-display)] text-4xl font-bold">
              {card.value}
            </span>
            <p className="text-ink-secondary mt-2 text-sm font-medium">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
