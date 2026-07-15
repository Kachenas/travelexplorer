'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  getAllAccommodationsAction,
  approveListingAction,
  rejectListingAction,
  adminToggleListingActiveAction,
} from '@/actions/admin-actions'
import type { Database } from '@/types/supabase'

type Accommodation = Database['public']['Tables']['accommodations']['Row'] & {
  owner_name: string
}

export default function AdminAccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  function loadAccommodations() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getAllAccommodationsAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setAccommodations(result.data)
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadAccommodations()
  }, [])

  function handleApprove(accommodation: Accommodation) {
    startTransition(async () => {
      const result = await approveListingAction('accommodation', accommodation.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${accommodation.name} approved`)
        loadAccommodations()
      }
    })
  }

  function handleReject(accommodation: Accommodation) {
    startTransition(async () => {
      const result = await rejectListingAction('accommodation', accommodation.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${accommodation.name} rejected`)
        loadAccommodations()
      }
    })
  }

  function handleToggleActive(accommodation: Accommodation, enabled: boolean) {
    startTransition(async () => {
      const result = await adminToggleListingActiveAction(
        'accommodation',
        accommodation.id,
        enabled,
      )
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${accommodation.name} ${enabled ? 'activated' : 'deactivated'}`)
        loadAccommodations()
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
          All Accommodations
        </h1>
        <p className="text-ink-secondary mt-2 text-base">
          Manage all accommodation listings on the platform.
        </p>
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : accommodations.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            No accommodations found
          </p>
          <p className="text-ink-secondary mt-2 text-base">
            No accommodation listings have been created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {accommodations.map((accommodation) => (
            <div
              key={accommodation.id}
              className="bg-surface shadow-card rounded-[var(--radius-card)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                      {accommodation.name}
                    </p>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        accommodation.is_approved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800',
                      )}
                    >
                      {accommodation.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    {!accommodation.is_active && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-ink-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span>
                      <span className="text-ink-tertiary">Owner:</span> {accommodation.owner_name}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Location:</span>{' '}
                      {accommodation.location}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Type:</span> {accommodation.type}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Price:</span> PHP{' '}
                      {Number(accommodation.price_per_night).toLocaleString()}/night
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Added:</span>{' '}
                      {formatDate(accommodation.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <StatusToggle
                    enabled={accommodation.is_active}
                    onChange={(enabled) => handleToggleActive(accommodation, enabled)}
                    disabled={isPending}
                    label="Active"
                  />
                  {!accommodation.is_approved && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(accommodation)}
                      disabled={isPending}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReject(accommodation)}
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
