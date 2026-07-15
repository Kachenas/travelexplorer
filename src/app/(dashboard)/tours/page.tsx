'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DataTableRow } from '@/components/ui/DataTableRow'
import { TourForm } from '@/components/forms/TourForm'
import { getMyToursAction, toggleTourActiveAction, deleteTourAction } from '@/actions/tour-actions'
import type { Database } from '@/types/supabase'

type Tour = Database['public']['Tables']['tours']['Row']

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<Tour | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Tour | null>(null)
  const [isPending, startTransition] = useTransition()

  function loadTours() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getMyToursAction()
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

  function handleAdd() {
    setSelectedTour(undefined)
    setModalOpen(true)
  }

  function handleEdit(tour: Tour) {
    setSelectedTour(tour)
    setModalOpen(true)
  }

  function handleFormSuccess() {
    setModalOpen(false)
    setSelectedTour(undefined)
    loadTours()
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteTourAction(deleteTarget.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Listing deactivated')
        loadTours()
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
            My Tours
          </h1>
        </div>
        <Button onClick={handleAdd} size="lg">
          + Add Tour
        </Button>
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : tours.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            You haven&apos;t listed any tours yet
          </p>
          <p className="text-ink-secondary mt-2 text-base">
            Click &quot;Add Tour&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tours.map((tour) => (
            <DataTableRow
              key={tour.id}
              name={tour.name}
              columns={[
                { label: 'Location', value: tour.location },
                {
                  label: 'Price',
                  value: `PHP ${Number(tour.price_per_person).toLocaleString()}/person`,
                },
                { label: 'Duration', value: `${Number(tour.duration_hours)}h` },
                { label: 'Max', value: `${tour.max_group_size} pax` },
              ]}
              isActive={tour.is_active}
              isApproved={tour.is_approved}
              onToggleActive={(enabled) => toggleTourActiveAction(tour.id, enabled)}
              onEdit={() => handleEdit(tour)}
              onDelete={() => setDeleteTarget(tour)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedTour ? 'Edit Tour' : 'Add Tour'}
      >
        <TourForm initialData={selectedTour} onSuccess={handleFormSuccess} />
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
