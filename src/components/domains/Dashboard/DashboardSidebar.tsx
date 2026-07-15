'use client'

import { Fragment, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { cn } from '@/utils/cn'
import { signOutAction } from '@/actions/auth-actions'
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  TruckIcon,
  BuildingOfficeIcon,
  MapIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'

interface DashboardSidebarProps {
  userEmail: string
  userType: string
}

interface NavItem {
  href: string
  label: string
  icon: typeof Squares2X2Icon
}

function getNavItems(userType: string): NavItem[] {
  const items: NavItem[] = [{ href: '/dashboard', label: 'Overview', icon: Squares2X2Icon }]

  if (userType === 'van_owner') {
    items.push({ href: '/vans', label: 'My Vans', icon: TruckIcon })
  }
  if (userType === 'hotel_owner') {
    items.push({ href: '/stays', label: 'My Stays', icon: BuildingOfficeIcon })
  }
  if (userType === 'tour_operator') {
    items.push({ href: '/tours', label: 'My Tours', icon: MapIcon })
  }

  items.push(
    { href: '/bookings', label: 'Bookings', icon: CalendarDaysIcon },
    { href: '/settings', label: 'Settings', icon: Cog6ToothIcon },
  )

  return items
}

export function DashboardSidebar({ userEmail, userType }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = getNavItems(userType)

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction()
    })
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <Link
          href="/"
          className="text-ink font-[family-name:var(--font-display)] text-xl font-bold tracking-tight"
        >
          Luzon Explore
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

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
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
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
      {/* Desktop Sidebar */}
      <aside className="border-border bg-surface hidden w-60 shrink-0 border-r lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="border-border bg-surface flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <Link
          href="/"
          className="text-ink font-[family-name:var(--font-display)] text-lg font-bold tracking-tight"
        >
          Luzon Explore
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="text-ink-secondary hover:text-ink rounded-[var(--radius-input)] p-2 transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
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
