'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { createBookingAction } from '@/actions/booking-actions'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  listing: {
    id: string
    name: string
    type: 'van' | 'hotel' | 'tour'
    pricePerUnit: number
    unitLabel: string
  }
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export function BookingModal({ isOpen, onClose, listing }: BookingModalProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [isPending, startTransition] = useTransition()

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0
  const totalPrice = days * listing.pricePerUnit

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be after start date')
      return
    }

    startTransition(async () => {
      const result = await createBookingAction({
        booking_type: listing.type,
        reference_id: listing.id,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        special_requests: specialRequests || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Booking confirmed')
      onClose()
      setStartDate('')
      setEndDate('')
      setSpecialRequests('')
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={listing.name}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="booking-start" className="text-ink-secondary block text-sm font-medium">
              Check-in
            </label>
            <input
              id="booking-start"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="booking-end" className="text-ink-secondary block text-sm font-medium">
              Check-out
            </label>
            <input
              id="booking-end"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="special-requests"
            className="text-ink-secondary block text-sm font-medium"
          >
            Special Requests
          </label>
          <textarea
            id="special-requests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Any special requirements..."
            className="border-border bg-surface text-ink placeholder:text-ink-faint focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
          />
        </div>

        {days > 0 && (
          <div className="bg-primary-light rounded-[var(--radius-input)] px-5 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-ink-secondary">
                PHP {listing.pricePerUnit.toLocaleString()} &times; {days} {listing.unitLabel}
                {days > 1 ? 's' : ''}
              </span>
              <span className="text-ink font-[family-name:var(--font-display)] text-xl font-bold">
                PHP {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !startDate || !endDate} className="flex-1">
            {isPending ? 'Booking...' : 'Confirm'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
