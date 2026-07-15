'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { getAllUsersAction, updateUserTypeAction } from '@/actions/admin-actions'
import { UserDetailModal } from '@/components/domains/Admin/UserDetailModal'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

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

export default function OwnersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [editTarget, setEditTarget] = useState<Profile | null>(null)
  const [newType, setNewType] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  function loadUsers() {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getAllUsersAction()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setUsers(result.data)
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadUsers()
  }, [])

  function handleEditOpen(user: Profile) {
    setEditTarget(user)
    setNewType(user.user_type)
  }

  function handleSaveType() {
    if (!editTarget || !newType) return
    startTransition(async () => {
      const result = await updateUserTypeAction(editTarget.id, newType)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Updated ${editTarget.full_name ?? 'user'} to ${userTypeLabels[newType]}`)
        loadUsers()
      }
      setEditTarget(null)
    })
  }

  const filtered = filter === 'all' ? users : users.filter((u) => u.user_type === filter)

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const filterOptions = [
    { key: 'all', label: 'All Users' },
    { key: 'van_owner', label: 'Van Owners' },
    { key: 'hotel_owner', label: 'Hotel Owners' },
    { key: 'tour_operator', label: 'Tour Operators' },
    { key: 'customer', label: 'Customers' },
    { key: 'admin', label: 'Admins' },
  ]

  return (
    <div>
      <div className="mb-10">
        <p className="text-primary text-sm font-medium">Admin</p>
        <h1 className="text-ink mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
          User Management
        </h1>
        <p className="text-ink-secondary mt-2 text-base">Manage platform users and their roles.</p>
      </div>

      {/* Filter tabs */}
      <div className="border-border mb-6 flex flex-wrap gap-1 border-b">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setFilter(opt.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors',
              filter === opt.key
                ? 'text-primary border-primary border-b-2'
                : 'text-ink-tertiary hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-ink-tertiary py-16 text-center text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface shadow-card rounded-[var(--radius-card)] py-16 text-center">
          <p className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            No users found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              role="button"
              tabIndex={0}
              onClick={() => setDetailUserId(user.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setDetailUserId(user.id)
                }
              }}
              className="bg-surface shadow-card hover:shadow-card-hover w-full cursor-pointer rounded-[var(--radius-card)] p-5 text-left transition-shadow"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                      {user.full_name ?? 'Unnamed User'}
                    </p>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        userTypeColors[user.user_type] ?? 'bg-ink-faint text-ink-secondary',
                      )}
                    >
                      {userTypeLabels[user.user_type] ?? user.user_type}
                    </span>
                    {user.is_suspended && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="text-ink-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {user.nationality && (
                      <span>
                        <span className="text-ink-tertiary">Nationality:</span> {user.nationality}
                      </span>
                    )}
                    <span>
                      <span className="text-ink-tertiary">Joined:</span>{' '}
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditOpen(user)
                  }}
                >
                  Change Role
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
        onSuspensionChange={loadUsers}
      />

      {/* Change Role Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Change User Role">
        {editTarget && (
          <div className="space-y-4">
            <p className="text-ink-secondary text-sm">
              Update role for{' '}
              <span className="text-ink font-medium">{editTarget.full_name ?? 'Unnamed User'}</span>
            </p>

            <Select
              id="user_type"
              name="user_type"
              label="Role"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              options={[
                { value: 'customer', label: 'Customer' },
                { value: 'van_owner', label: 'Van Owner' },
                { value: 'hotel_owner', label: 'Hotel Owner' },
                { value: 'tour_operator', label: 'Tour Operator' },
                { value: 'admin', label: 'Admin' },
              ]}
            />

            <div className="border-border flex gap-3 border-t pt-4">
              <Button variant="secondary" onClick={() => setEditTarget(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveType} disabled={isPending} className="flex-1">
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
