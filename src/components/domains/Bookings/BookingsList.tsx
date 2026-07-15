'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { cancelBookingAction } from '@/actions/booking-actions'
import type { Database } from '@/types/supabase'

type Booking = Database['public']['Tables']['bookings']['Row']

interface BookingsListProps {
  bookings: Booking[]
}

const typeLabels: Record<string, string> = {
  van: 'Van Rental',
  hotel: 'Accommodation',
  bundle: 'Bundle',
}

export function BookingsList({ bookings }: BookingsListProps) {
  const [isPending, startTransition] = useTransition()

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await cancelBookingAction(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Booking cancelled')
      }
    })
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-surface shadow-card flex flex-col gap-4 rounded-[var(--radius-card)] p-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            {/* Status indicator */}
            <div className="mt-1.5 flex-shrink-0">
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  booking.status === 'confirmed' && 'bg-primary',
                  booking.status === 'pending' && 'border-primary border-2 bg-transparent',
                  booking.status === 'cancelled' && 'bg-ink-faint',
                )}
                title={booking.status}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-ink-secondary text-sm font-medium">
                  {typeLabels[booking.booking_type] ?? booking.booking_type}
                </span>
                <span
                  className={cn(
                    'rounded-[var(--radius-badge)] px-2 py-0.5 text-xs font-medium capitalize',
                    booking.status === 'confirmed' && 'bg-primary-light text-primary',
                    booking.status === 'pending' && 'bg-surface-alt text-ink-tertiary',
                    booking.status === 'cancelled' && 'bg-surface-alt text-ink-faint',
                  )}
                >
                  {booking.status}
                </span>
              </div>

              <p className="text-ink text-base">
                {new Date(booking.start_date).toLocaleDateString('en-PH', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                &mdash;{' '}
                {new Date(booking.end_date).toLocaleDateString('en-PH', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              {booking.special_requests && (
                <p className="text-ink-tertiary text-sm">{booking.special_requests}</p>
              )}

              <p className="text-ink-faint text-xs">Ref: {booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <span className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
              PHP {Number(booking.total_price).toLocaleString()}
            </span>

            {booking.status === 'pending' && (
              <Button
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={() => handleCancel(booking.id)}
              >
                {isPending ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
