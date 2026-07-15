'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  getPendingListingsAction,
  approveListingAction,
  rejectListingAction,
} from '@/actions/admin-actions'

type ListingType = 'vehicle' | 'accommodation' | 'tour'
type TabKey = 'all' | ListingType

interface PendingItem {
  id: string
  name: string
  type: ListingType
  owner_name: string
  location: string
  detail: string
  description: string | null
  created_at: string
}

export default function ApprovalsPage() {
  const [items, setItems] = useState<PendingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [detailItem, setDetailItem] = useState<PendingItem | null>(null)

  function loadPending() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getPendingListingsAction()
      if (result.error) {
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      const data = result.data!
      const normalized: PendingItem[] = [
        ...data.vehicles.map((v) => ({
          id: v.id,
          name: v.name,
          type: 'vehicle' as const,
          owner_name: v.owner_name,
          location: v.base_location,
          detail: `${v.capacity} pax · PHP ${Number(v.daily_rate).toLocaleString()}/day`,
          description: v.description,
          created_at: v.created_at,
        })),
        ...data.accommodations.map((a) => ({
          id: a.id,
          name: a.name,
          type: 'accommodation' as const,
          owner_name: a.owner_name,
          location: a.location,
          detail: `${a.type} · PHP ${Number(a.price_per_night).toLocaleString()}/night`,
          description: a.description,
          created_at: a.created_at,
        })),
        ...data.tours.map((t) => ({
          id: t.id,
          name: t.name,
          type: 'tour' as const,
          owner_name: t.owner_name,
          location: t.location,
          detail: `${Number(t.duration_hours)}h · PHP ${Number(t.price_per_person).toLocaleString()}/person`,
          description: t.description,
          created_at: t.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setItems(normalized)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadPending()
  }, [])

  function handleApprove(item: PendingItem) {
    startTransition(async () => {
      const result = await approveListingAction(item.type, item.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${item.name} approved`)
        loadPending()
      }
    })
  }

  function handleReject(item: PendingItem) {
    startTransition(async () => {
      const result = await rejectListingAction(item.type, item.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${item.name} rejected`)
        loadPending()
      }
    })
  }

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.type === activeTab)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: `All (${items.length})` },
    { key: 'vehicle', label: `Vans (${items.filter((i) => i.type === 'vehicle').length})` },
    {
      key: 'accommodation',
      label: `Stays (${items.filter((i) => i.type === 'accommodation').length})`,
    },
    { key: 'tour', label: `Tours (${items.filter((i) => i.type === 'tour').length})` },
  ]

  const typeLabel: Record<ListingType, string> = {
    vehicle: 'Van',
    accommodation: 'Stay',
    tour: 'Tour',
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
          Pending Approvals
        </h1>
        <p className="text-ink-secondary mt-2 text-base">
          Review and approve new listings from owners.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-border mb-6 flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-primary border-primary border-b-2'
                : 'text-ink-tertiary hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            No pending approvals
          </p>
          <p className="text-ink-secondary mt-2 text-base">All listings have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-surface shadow-card rounded-[var(--radius-card)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                      {item.name}
                    </p>
                    <span className="bg-ink-faint text-ink-secondary rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {typeLabel[item.type]}
                    </span>
                  </div>
                  <div className="text-ink-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span>
                      <span className="text-ink-tertiary">Owner:</span> {item.owner_name}
                    </span>
                    <span>
                      <span className="text-ink-tertiary">Location:</span> {item.location}
                    </span>
                    <span>{item.detail}</span>
                    <span>
                      <span className="text-ink-tertiary">Submitted:</span>{' '}
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setDetailItem(item)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(item)} disabled={isPending}>
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReject(item)}
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

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem?.name ?? 'Listing Details'}
      >
        {detailItem && (
          <div className="space-y-4">
            <div className="text-ink-secondary space-y-2 text-sm">
              <p>
                <span className="text-ink font-medium">Type:</span> {typeLabel[detailItem.type]}
              </p>
              <p>
                <span className="text-ink font-medium">Owner:</span> {detailItem.owner_name}
              </p>
              <p>
                <span className="text-ink font-medium">Location:</span> {detailItem.location}
              </p>
              <p>
                <span className="text-ink font-medium">Details:</span> {detailItem.detail}
              </p>
              <p>
                <span className="text-ink font-medium">Submitted:</span>{' '}
                {formatDate(detailItem.created_at)}
              </p>
              {detailItem.description && (
                <div>
                  <span className="text-ink font-medium">Description:</span>
                  <p className="mt-1 whitespace-pre-wrap">{detailItem.description}</p>
                </div>
              )}
            </div>

            <div className="border-border flex gap-3 border-t pt-4">
              <Button
                onClick={() => {
                  handleApprove(detailItem)
                  setDetailItem(null)
                }}
                disabled={isPending}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  handleReject(detailItem)
                  setDetailItem(null)
                }}
                disabled={isPending}
                className="flex-1 text-red-500 hover:text-red-600"
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
