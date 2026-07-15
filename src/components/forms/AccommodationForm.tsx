'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import {
  createAccommodationAction,
  updateAccommodationAction,
} from '@/actions/accommodation-actions'
import { FormImageUploader } from '@/components/ui/FormImageUploader'
import type { Database } from '@/types/supabase'

type Accommodation = Database['public']['Tables']['accommodations']['Row']

interface AccommodationFormProps {
  initialData?: Accommodation
  onSuccess?: () => void
}

export function AccommodationForm({ initialData, onSuccess }: AccommodationFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!initialData

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateAccommodationAction(initialData.id, formData)
        : await createAccommodationAction(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(
        isEditing ? 'Accommodation updated successfully' : 'Listing created. Pending approval.',
      )
      onSuccess?.()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        label="Name"
        placeholder="e.g., Pine View Lodge"
        defaultValue={initialData?.name}
        required
      />

      <div className="grid grid-cols-2 gap-6">
        <Select
          id="type"
          name="type"
          label="Type"
          defaultValue={initialData?.type ?? 'hotel'}
          options={[
            { value: 'hotel', label: 'Hotel' },
            { value: 'homestay', label: 'Homestay' },
            { value: 'resort', label: 'Resort' },
          ]}
        />
        <Input
          id="price_per_night"
          name="price_per_night"
          label="Price / Night (PHP)"
          type="number"
          min={0}
          step={100}
          defaultValue={initialData ? Number(initialData.price_per_night) : undefined}
          required
        />
      </div>

      <Input
        id="location"
        name="location"
        label="Location"
        placeholder="e.g., Baguio City, Benguet"
        defaultValue={initialData?.location}
        required
      />

      <div className="flex items-center gap-3">
        <input
          id="accepts_credit_card"
          name="accepts_credit_card"
          type="checkbox"
          value="true"
          defaultChecked={initialData?.accepts_credit_card ?? false}
          className="border-border accent-primary h-4 w-4 rounded"
        />
        <label htmlFor="accepts_credit_card" className="text-ink text-sm">
          Accepts credit card
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
          placeholder="Describe your accommodation..."
          className="border-border bg-surface text-ink placeholder:text-ink-faint focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
        />
      </div>

      <FormImageUploader bucket="accommodation-images" defaultValue={initialData?.images ?? []} />

      <div className="border-border border-t pt-6">
        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          {isPending ? 'Saving...' : isEditing ? 'Update Accommodation' : 'Create Accommodation'}
        </Button>
      </div>
    </form>
  )
}
