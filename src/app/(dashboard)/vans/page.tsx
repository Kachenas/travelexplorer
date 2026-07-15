'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DataTableRow } from '@/components/ui/DataTableRow'
import { VanForm } from '@/components/forms/VanForm'
import { getMyVansAction, toggleVanActiveAction, deleteVanAction } from '@/actions/van-actions'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']

export default function VansPage() {
  const [vans, setVans] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVan, setSelectedVan] = useState<Vehicle | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)
  const [isPending, startTransition] = useTransition()

  function loadVans() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getMyVansAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setVans(result.data)
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadVans()
  }, [])

  function handleAdd() {
    setSelectedVan(undefined)
    setModalOpen(true)
  }

  function handleEdit(van: Vehicle) {
    setSelectedVan(van)
    setModalOpen(true)
  }

  function handleFormSuccess() {
    setModalOpen(false)
    setSelectedVan(undefined)
    loadVans()
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteVanAction(deleteTarget.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Listing deactivated')
        loadVans()
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
            My Vans
          </h1>
        </div>
        <Button onClick={handleAdd} size="lg">
          + Add Van
        </Button>
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : vans.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            You haven&apos;t listed any vans yet
          </p>
          <p className="text-ink-secondary mt-2 text-base">
            Click &quot;Add Van&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vans.map((van) => (
            <DataTableRow
              key={van.id}
              name={van.name}
              columns={[
                { label: 'Location', value: van.base_location },
                { label: 'Rate', value: `PHP ${Number(van.daily_rate).toLocaleString()}/day` },
                { label: 'Capacity', value: `${van.capacity} pax` },
              ]}
              isActive={van.is_active}
              isApproved={van.is_approved}
              onToggleActive={(enabled) => toggleVanActiveAction(van.id, enabled)}
              onEdit={() => handleEdit(van)}
              onDelete={() => setDeleteTarget(van)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedVan ? 'Edit Van' : 'Add Van'}
      >
        <VanForm initialData={selectedVan} onSuccess={handleFormSuccess} />
      </Modal>

      {/* Delete Confirmation Modal */}
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
