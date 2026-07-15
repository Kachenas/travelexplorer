'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { StatusToggle } from '@/components/ui/StatusToggle'
import {
  getAllVehiclesAction,
  approveListingAction,
  rejectListingAction,
  adminToggleListingActiveAction,
} from '@/actions/admin-actions'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row'] & { owner_name: string }

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  function loadVehicles() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getAllVehiclesAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setVehicles(result.data)
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  function handleApprove(vehicle: Vehicle) {
    startTransition(async () => {
      const result = await approveListingAction('vehicle', vehicle.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${vehicle.name} approved`)
        loadVehicles()
      }
    })
  }

  function handleReject(vehicle: Vehicle) {
    startTransition(async () => {
      const result = await rejectListingAction('vehicle', vehicle.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${vehicle.name} rejected`)
        loadVehicles()
      }
    })
  }

  function handleToggleActive(vehicle: Vehicle, enabled: boolean) {
    startTransition(async () => {
      const result = await adminToggleListingActiveAction('vehicle', vehicle.id, enabled)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${vehicle.name} ${enabled ? 'activated' : 'deactivated'}`)
        loadVehicles()
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
          All Vehicles
        </h1>
        <p className="text-ink-secondary mt-2 text-base">
          Manage all vehicle listings on the platform.
        </p>
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            No vehicles found
          </p>
          <p className="text-ink-secondary mt-2 text-base">
            No vehicle listings have been created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-surface shadow-card rounded-[var(--radius-card)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                      {vehicle.name}
                    </p>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        vehicle.is_approved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800',
                      )}
                    >
                      {vehicle.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    {!vehicle.is_active && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-ink-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span>
                      <span className="text-ink-tertiary">Owner:</span> {vehicle.owner_name}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Location:</span> {vehicle.base_location}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Rate:</span> PHP{' '}
                      {Number(vehicle.daily_rate).toLocaleString()}/day
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Capacity:</span> {vehicle.capacity} pax
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Transmission:</span>{' '}
                      {vehicle.transmission}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Added:</span>{' '}
                      {formatDate(vehicle.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <StatusToggle
                    enabled={vehicle.is_active}
                    onChange={(enabled) => handleToggleActive(vehicle, enabled)}
                    disabled={isPending}
                    label="Active"
                  />
                  {!vehicle.is_approved && (
                    <Button size="sm" onClick={() => handleApprove(vehicle)} disabled={isPending}>
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReject(vehicle)}
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
