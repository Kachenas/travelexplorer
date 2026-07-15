'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { getOwnerBookingsAction, updateBookingStatusAction } from '@/actions/booking-actions'
import type { Database } from '@/types/supabase'

type Booking = Database['public']['Tables']['bookings']['Row']
type OwnerBooking = Booking & { listing_name: string; customer_name: string }

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<OwnerBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  function loadBookings() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getOwnerBookingsAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setBookings(result.data as OwnerBooking[])
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadBookings()
  }, [])

  function handleStatusUpdate(id: string, status: 'confirmed' | 'cancelled') {
    startTransition(async () => {
      const result = await updateBookingStatusAction(id, status)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Booking ${status}`)
        loadBookings()
      }
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-primary text-sm font-medium">Dashboard</p>
        <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          Bookings
        </h1>
        <p className="text-ink-secondary mt-2 text-base">
          Manage incoming bookings for your listings.
        </p>
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            No bookings yet
          </p>
          <p className="text-ink-secondary mt-2 text-base">
            Bookings for your listings will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-surface shadow-card rounded-[var(--radius-card)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                    {booking.listing_name}
                  </p>
                  <div className="text-ink-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span>
                      <span className="text-ink-tertiary">Customer:</span> {booking.customer_name}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Dates:</span>{' '}
                      {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Total:</span> PHP{' '}
                      {Number(booking.total_price).toLocaleString()}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Type:</span> {booking.booking_type}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium capitalize',
                      statusColors[booking.status] ?? 'bg-ink-faint text-ink-secondary',
                    )}
                  >
                    {booking.status}
                  </span>

                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        disabled={isPending}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        disabled={isPending}
                        className="text-ink-tertiary hover:text-red-500"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
