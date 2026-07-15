'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { StatusToggle } from '@/components/ui/StatusToggle'
import { Button } from '@/components/ui/Button'

interface DataTableRowProps {
  name: string
  columns: { label: string; value: string }[]
  isActive: boolean
  isApproved: boolean
  onToggleActive: (enabled: boolean) => Promise<{ error?: string | null }>
  onEdit: () => void
  onDelete: () => void
}

export function DataTableRow({
  name,
  columns,
  isActive,
  isApproved,
  onToggleActive,
  onEdit,
  onDelete,
}: DataTableRowProps) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(enabled: boolean) {
    startTransition(async () => {
      const result = await onToggleActive(enabled)
      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div
      className={cn(
        'bg-surface shadow-card flex items-center justify-between rounded-[var(--radius-card)] p-5 transition-opacity',
        !isActive && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">{name}</p>
        <div className="text-ink-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {columns.map((col) => (
            <span key={col.label}>
              <span className="text-ink-tertiary">{col.label}:</span> {col.value}
            </span>
          ))}
        </div>
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              isApproved ? 'bg-primary' : 'border-ink-faint border-2',
            )}
          />
          <span className="text-ink-tertiary text-xs">{isApproved ? 'Approved' : 'Pending'}</span>
        </div>

        <StatusToggle enabled={isActive} onChange={handleToggle} disabled={isPending} />

        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-ink-tertiary hover:text-red-500"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
