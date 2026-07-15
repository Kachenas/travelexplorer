'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusToggle } from '@/components/ui/StatusToggle'
import { createVanAction, updateVanAction } from '@/actions/van-actions'
import { FormImageUploader } from '@/components/ui/FormImageUploader'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']

interface VanFormProps {
  initialData?: Vehicle
  onSuccess?: () => void
}

export function VanForm({ initialData, onSuccess }: VanFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!initialData

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateVanAction(initialData.id, formData)
        : await createVanAction(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditing ? 'Van updated successfully' : 'Listing created. Pending approval.')
      onSuccess?.()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        label="Vehicle Name"
        placeholder="e.g., Toyota Grandia"
        defaultValue={initialData?.name}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <Input
          id="capacity"
          name="capacity"
          label="Capacity"
          type="number"
          min={1}
          max={30}
          defaultValue={initialData?.capacity}
          required
        />
        <Select
          id="transmission"
          name="transmission"
          label="Transmission"
          defaultValue={initialData?.transmission ?? 'auto'}
          options={[
            { value: 'auto', label: 'Automatic' },
            { value: 'manual', label: 'Manual' },
          ]}
        />
      </div>

      <Input
        id="base_location"
        name="base_location"
        label="Base Location"
        placeholder="e.g., Manila, Metro Manila"
        defaultValue={initialData?.base_location}
        required
      />

      <Input
        id="daily_rate"
        name="daily_rate"
        label="Daily Rate (PHP)"
        type="number"
        min={0}
        step={100}
        defaultValue={initialData ? Number(initialData.daily_rate) : undefined}
        required
      />

      <div className="flex items-center gap-3">
        <input
          id="driver_included"
          name="driver_included"
          type="checkbox"
          value="true"
          defaultChecked={initialData?.driver_included ?? true}
          className="border-border accent-primary h-4 w-4 rounded"
        />
        <label htmlFor="driver_included" className="text-ink text-sm">
          Driver included
        </label>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-ink-secondary block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={initialData?.description ?? ''}
          placeholder="Describe your vehicle, routes you cover..."
          className="border-border bg-surface text-ink placeholder:text-ink-faint focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
        />
      </div>

      <FormImageUploader bucket="vehicle-images" defaultValue={initialData?.images ?? []} />

      <div className="border-border border-t pt-6">
        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? 'Saving...' : isEditing ? 'Update Van' : 'Create Van'}
        </Button>
      </div>
    </form>
  )
}
