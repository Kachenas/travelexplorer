'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateProfileAction } from '@/actions/profile-actions'

const userTypeLabels: Record<string, string> = {
  van_owner: 'Van Renter',
  hotel_owner: 'Hotelier',
  tour_operator: 'Tour Operator',
  customer: 'Customer',
}

interface SettingsFormProps {
  fullName: string
  nationality: string
  email: string
  userType: string
}

export function SettingsForm({ fullName, nationality, email, userType }: SettingsFormProps) {
  const [name, setName] = useState(fullName)
  const [nat, setNat] = useState(nationality)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateProfileAction({
        full_name: name.trim(),
        nationality: nat.trim() || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Profile updated')
    })
  }

  return (
    <div className="bg-surface shadow-card rounded-[var(--radius-card)] p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input id="email" label="Email" value={email} disabled />

        <div className="space-y-1.5">
          <span className="text-ink-secondary block text-sm font-medium">Account Type</span>
          <p className="text-ink text-base font-medium">{userTypeLabels[userType] ?? userType}</p>
        </div>

        <Input
          id="full_name"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />

        <Input
          id="nationality"
          label="Nationality"
          value={nat}
          onChange={(e) => setNat(e.target.value)}
          placeholder="e.g., Filipino"
        />

        <div className="border-border border-t pt-6">
          <Button type="submit" disabled={isPending || !name.trim()} className="w-full" size="lg">
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
