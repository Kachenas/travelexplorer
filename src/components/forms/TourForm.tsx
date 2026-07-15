'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createTourAction, updateTourAction } from '@/actions/tour-actions'
import { FormImageUploader } from '@/components/ui/FormImageUploader'
import type { Database } from '@/types/supabase'

type Tour = Database['public']['Tables']['tours']['Row']

interface TourFormProps {
  initialData?: Tour
  onSuccess?: () => void
}

export function TourForm({ initialData, onSuccess }: TourFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!initialData

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateTourAction(initialData.id, formData)
        : await createTourAction(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditing ? 'Tour updated successfully' : 'Listing created. Pending approval.')
      onSuccess?.()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        label="Tour Name"
        placeholder="e.g., Sagada Cave Connection Tour"
        defaultValue={initialData?.name}
        required
      />

      <Input
        id="location"
        name="location"
        label="Location"
        placeholder="e.g., Sagada, Mountain Province"
        defaultValue={initialData?.location}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <Input
          id="duration_hours"
          name="duration_hours"
          label="Duration (hours)"
          type="number"
          min={0.5}
          step={0.5}
          defaultValue={initialData ? Number(initialData.duration_hours) : undefined}
          required
        />
        <Input
          id="price_per_person"
          name="price_per_person"
          label="Price per Person (PHP)"
          type="number"
          min={0}
          step={50}
          defaultValue={initialData ? Number(initialData.price_per_person) : undefined}
          required
        />
      </div>

      <Input
        id="max_group_size"
        name="max_group_size"
        label="Max Group Size"
        type="number"
        min={1}
        max={100}
        defaultValue={initialData?.max_group_size}
        required
      />

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
          placeholder="Describe your tour, what's included, difficulty level..."
          className="border-border bg-surface text-ink placeholder:text-ink-faint focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
        />
      </div>

      <FormImageUploader bucket="tour-images" defaultValue={initialData?.images ?? []} />

      <div className="border-border border-t pt-6">
        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? 'Saving...' : isEditing ? 'Update Tour' : 'Create Tour'}
        </Button>
      </div>
    </form>
  )
}
