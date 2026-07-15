'use client'

import { Fragment, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { cn } from '@/utils/cn'
import { signOutAction } from '@/actions/auth-actions'
import {
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

interface AdminSidebarProps {
  userEmail: string
  pendingCount: number
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: Squares2X2Icon },
  { href: '/admin/approvals', label: 'Approvals', icon: ClipboardDocumentCheckIcon },
  { href: '/admin/owners', label: 'Owners', icon: UsersIcon },
]

export function AdminSidebar({ userEmail, pendingCount }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6">
        <Link
          href="/admin"
          className="text-ink font-[family-name:var(--font-display)] text-xl font-bold tracking-tight"
        >
          Admin Panel
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const showBadge = item.href === '/admin/approvals' && pendingCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium transition-colors duration-300',
                active
                  ? 'bg-primary-light text-primary'
                  : 'text-ink-secondary hover:bg-surface-alt hover:text-ink',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-primary rounded-full px-2 py-0.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-border border-t px-4 py-4">
        <p className="text-ink-tertiary truncate text-sm">{userEmail}</p>
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="text-ink-secondary hover:text-primary mt-2 flex items-center gap-2 text-sm font-medium transition-colors duration-300 disabled:opacity-40"
        >
          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="border-border bg-surface hidden w-60 shrink-0 border-r lg:block">
        {sidebarContent}
      </aside>

      <div className="border-border bg-surface flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <Link
          href="/admin"
          className="text-ink font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
        >
          Admin Panel
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="text-ink-secondary hover:text-ink rounded-[var(--radius-input)] p-2 transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      <Transition show={mobileOpen} as={Fragment}>
        <Dialog onClose={() => setMobileOpen(false)} className="relative z-50 lg:hidden">
          <TransitionChild
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-overlay fixed inset-0" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="transition-transform duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="bg-surface shadow-float fixed inset-y-0 left-0 w-72">
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="text-ink-secondary hover:text-ink rounded-[var(--radius-input)] p-1 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              {sidebarContent}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  )
}
