'use client'

import { useState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Modal } from '@/components/ui/Modal'
import { Switch } from '@headlessui/react'
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { getUserDetailAction, toggleSuspendUserAction } from '@/actions/admin-actions'
import type { ProfileWithEmail } from '@/services/AdminService'

interface UserDetailModalProps {
  userId: string | null
  onClose: () => void
  onSuspensionChange?: () => void
}

const userTypeLabels: Record<string, string> = {
  customer: 'Customer',
  van_owner: 'Van Owner',
  hotel_owner: 'Hotel Owner',
  tour_operator: 'Tour Operator',
  admin: 'Admin',
}

const userTypeColors: Record<string, string> = {
  customer: 'bg-ink-faint text-ink-secondary',
  van_owner: 'bg-blue-100 text-blue-800',
  hotel_owner: 'bg-purple-100 text-purple-800',
  tour_operator: 'bg-emerald-100 text-emerald-800',
  admin: 'bg-amber-100 text-amber-800',
}

export function UserDetailModal({ userId, onClose, onSuspensionChange }: UserDetailModalProps) {
  const [profile, setProfile] = useState<ProfileWithEmail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      return
    }

    setIsLoading(true)
    getUserDetailAction(userId).then((result) => {
      if (result.error) {
        toast.error(result.error)
        onClose()
      } else if (result.data) {
        setProfile(result.data)
      }
      setIsLoading(false)
    })
  }, [userId, onClose])

  function handleToggleSuspension() {
    if (!profile) return
    const newValue = !profile.is_suspended
    startTransition(async () => {
      const result = await toggleSuspendUserAction(profile.id, newValue)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(newValue ? 'Account suspended' : 'Account reactivated')
        setProfile({ ...profile, is_suspended: newValue })
        onSuspensionChange?.()
      }
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Modal isOpen={!!userId} onClose={onClose} title="User Details" className="max-w-2xl">
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="bg-surface-alt h-6 w-48 rounded" />
            <div className="bg-surface-alt h-4 w-64 rounded" />
            <div className="bg-surface-alt h-4 w-40 rounded" />
          </div>
          <div className="bg-surface-alt h-px" />
          <div className="bg-surface-alt h-10 w-full rounded" />
          <div className="bg-surface-alt h-px" />
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-alt h-32 rounded" />
            <div className="bg-surface-alt h-32 rounded" />
            <div className="bg-surface-alt h-32 rounded" />
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-ink font-[family-name:var(--font-display)] text-xl font-bold">
                {profile.full_name ?? 'Unnamed User'}
              </h3>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  userTypeColors[profile.user_type] ?? 'bg-ink-faint text-ink-secondary',
                )}
              >
                {userTypeLabels[profile.user_type] ?? profile.user_type}
              </span>
              {profile.is_suspended && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  Suspended
                </span>
              )}
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="text-ink-secondary flex items-center gap-2 text-sm">
                <EnvelopeIcon className="h-4 w-4 shrink-0" />
                <span>{profile.email}</span>
              </div>
              {profile.contact_number ? (
                <div className="text-ink-secondary flex items-center gap-2 text-sm">
                  <PhoneIcon className="h-4 w-4 shrink-0" />
                  <span>{profile.contact_number}</span>
                </div>
              ) : (
                <div className="text-ink-tertiary flex items-center gap-2 text-sm">
                  <PhoneIcon className="h-4 w-4 shrink-0" />
                  <span>No contact number</span>
                </div>
              )}
            </div>
          </div>

          {/* Suspension toggle */}
          <div className="border-border border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink text-sm font-medium">
                  {profile.is_suspended ? 'Account Suspended' : 'Account Active'}
                </p>
                <p className="text-ink-tertiary text-xs">
                  {profile.is_suspended
                    ? 'This user cannot access the platform'
                    : 'This user has full platform access'}
                </p>
              </div>
              <Switch
                checked={!profile.is_suspended}
                onChange={handleToggleSuspension}
                disabled={isPending}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  !profile.is_suspended ? 'bg-primary' : 'bg-ink-faint',
                  isPending && 'opacity-50',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200',
                    !profile.is_suspended ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </Switch>
            </div>
          </div>

          {/* Documents */}
          <div className="border-border border-t pt-4">
            <p className="text-ink mb-3 text-sm font-medium">Documents</p>
            <div className="grid grid-cols-3 gap-4">
              <DocumentPreview label="Valid ID" data={profile.identification} />
              <DocumentPreview label="Business Permit" data={profile.business_permit} />
              <DocumentPreview label="Supporting Doc" data={profile.document} />
            </div>
          </div>

          {/* Info */}
          <div className="border-border border-t pt-4">
            <div className="text-ink-secondary flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {profile.nationality && (
                <span>
                  <span className="text-ink-tertiary">Nationality:</span> {profile.nationality}
                </span>
              )}
              <span>
                <span className="text-ink-tertiary">Joined:</span>{' '}
                {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

function DocumentPreview({ label, data }: { label: string; data: string | null }) {
  if (!data) {
    return (
      <div className="space-y-1.5">
        <p className="text-ink-tertiary text-xs font-medium">{label}</p>
        <div className="bg-surface-alt flex h-32 items-center justify-center rounded-[var(--radius-input)] border border-dashed">
          <p className="text-ink-tertiary text-xs">Not uploaded</p>
        </div>
      </div>
    )
  }

  const src = data.startsWith('data:') ? data : `data:image/png;base64,${data}`

  return (
    <div className="space-y-1.5">
      <p className="text-ink-tertiary text-xs font-medium">{label}</p>
      <img
        src={src}
        alt={label}
        className="h-32 w-full rounded-[var(--radius-input)] border object-cover"
      />
    </div>
  )
}
