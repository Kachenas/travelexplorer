'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  getAllToursAction,
  approveListingAction,
  rejectListingAction,
  adminToggleListingActiveAction,
} from '@/actions/admin-actions'
import type { Database } from '@/types/supabase'

type Tour = Database['public']['Tables']['tours']['Row'] & { owner_name: string }

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  function loadTours() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getAllToursAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setTours(result.data)
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadTours()
  }, [])

  function handleApprove(tour: Tour) {
    startTransition(async () => {
      const result = await approveListingAction('tour', tour.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${tour.name} approved`)
        loadTours()
      }
    })
  }

  function handleReject(tour: Tour) {
    startTransition(async () => {
      const result = await rejectListingAction('tour', tour.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${tour.name} rejected`)
        loadTours()
      }
    })
  }

  function handleToggleActive(tour: Tour, enabled: boolean) {
    startTransition(async () => {
      const result = await adminToggleListingActiveAction('tour', tour.id, enabled)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${tour.name} ${enabled ? 'activated' : 'deactivated'}`)
        loadTours()
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
        <p className="text-primary text-sm font-medium">Admin</p>
        <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          All Tours
        </h1>
        <p className="text-ink-secondary mt-2 text-base">
          Manage all tour listings on the platform.
        </p>
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : tours.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            No tours found
          </p>
          <p className="text-ink-secondary mt-2 text-base">
            No tour listings have been created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-surface shadow-card rounded-[var(--radius-card)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                      {tour.name}
                    </p>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        tour.is_approved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800',
                      )}
                    >
                      {tour.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    {!tour.is_active && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-ink-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span>
                      <span className="text-ink-tertiary">Owner:</span> {tour.owner_name}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Location:</span> {tour.location}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Duration:</span>{' '}
                      {Number(tour.duration_hours)}h
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Price:</span> PHP{' '}
                      {Number(tour.price_per_person).toLocaleString()}/person
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Max Group:</span> {tour.max_group_size}{' '}
                      pax
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Added:</span>{' '}
                      {formatDate(tour.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <StatusToggle
                    enabled={tour.is_active}
                    onChange={(enabled) => handleToggleActive(tour, enabled)}
                    disabled={isPending}
                    label="Active"
                  />
                  {!tour.is_approved && (
                    <Button size="sm" onClick={() => handleApprove(tour)} disabled={isPending}>
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReject(tour)}
                    disabled={isPending}
                    className="text-ink-tertiary hover:text-red-500"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
