'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DataTableRow } from '@/components/ui/DataTableRow'
import { AccommodationForm } from '@/components/forms/AccommodationForm'
import {
  getMyAccommodationsAction,
  toggleAccommodationActiveAction,
  deleteAccommodationAction,
} from '@/actions/accommodation-actions'
import type { Database } from '@/types/supabase'

type Accommodation = Database['public']['Tables']['accommodations']['Row']

export default function StaysPage() {
  const [stays, setStays] = useState<Accommodation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStay, setSelectedStay] = useState<Accommodation | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Accommodation | null>(null)
  const [isPending, startTransition] = useTransition()

  function loadStays() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getMyAccommodationsAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setStays(result.data)
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadStays()
  }, [])

  function handleAdd() {
    setSelectedStay(undefined)
    setModalOpen(true)
  }

  function handleEdit(stay: Accommodation) {
    setSelectedStay(stay)
    setModalOpen(true)
  }

  function handleFormSuccess() {
    setModalOpen(false)
    setSelectedStay(undefined)
    loadStays()
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteAccommodationAction(deleteTarget.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Listing deactivated')
        loadStays()
      }
      setDeleteTarget(null)
    })
  }

  return (
    <div>
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-primary text-sm font-medium">Dashboard</p>
          <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            My Stays
          </h1>
        </div>
        <Button onClick={handleAdd} size="lg">
          + Add Accommodation
        </Button>
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : stays.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            You haven&apos;t listed any accommodations yet
          </p>
          <p className="text-ink-secondary mt-2 text-base">
            Click &quot;Add Accommodation&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stays.map((stay) => (
            <DataTableRow
              key={stay.id}
              name={stay.name}
              columns={[
                { label: 'Location', value: stay.location },
                { label: 'Type', value: stay.type },
                {
                  label: 'Rate',
                  value: `PHP ${Number(stay.price_per_night).toLocaleString()}/night`,
                },
              ]}
              isActive={stay.is_active}
              isApproved={stay.is_approved}
              onToggleActive={(enabled) => toggleAccommodationActiveAction(stay.id, enabled)}
              onEdit={() => handleEdit(stay)}
              onDelete={() => setDeleteTarget(stay)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedStay ? 'Edit Accommodation' : 'Add Accommodation'}
      >
        <AccommodationForm initialData={selectedStay} onSuccess={handleFormSuccess} />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate Listing"
      >
        <p className="text-ink-secondary text-sm">
          Are you sure you want to deactivate this listing? This will hide it from public search.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} disabled={isPending} className="flex-1">
            {isPending ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
