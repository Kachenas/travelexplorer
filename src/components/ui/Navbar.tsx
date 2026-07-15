'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface NavbarProps {
  user?: { email?: string } | null
}

const navLinks = [
  { href: '/search', label: 'Explore' },
  { href: '/search?type=van', label: 'Vans' },
  { href: '/search?type=hotel', label: 'Stays' },
]

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="border-border/60 bg-surface/80 fixed top-0 right-0 left-0 z-40 border-b backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-ink font-[family-name:var(--font-display)] text-xl font-bold tracking-tight"
        >
          Luzon Explore
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-secondary hover:text-primary font-[family-name:var(--font-body)] text-sm font-medium transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary-hover hover:shadow-glow rounded-[var(--radius-button)] px-5 py-2.5 font-[family-name:var(--font-body)] text-sm font-semibold text-white shadow-sm transition-all duration-300"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-ink-secondary hover:text-primary font-[family-name:var(--font-body)] text-sm font-medium transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:bg-primary-hover hover:shadow-glow rounded-[var(--radius-button)] px-5 py-2.5 font-[family-name:var(--font-body)] text-sm font-semibold text-white shadow-sm transition-all duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-ink-secondary hover:bg-surface-alt rounded-[var(--radius-input)] p-2 transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'border-border/60 bg-surface overflow-hidden border-t transition-all duration-300 md:hidden',
          mobileOpen ? 'max-h-96' : 'max-h-0 border-t-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-ink-secondary hover:bg-primary-light hover:text-primary rounded-[var(--radius-input)] px-4 py-3 font-[family-name:var(--font-body)] text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="bg-primary mt-2 rounded-[var(--radius-button)] px-4 py-3 text-center font-[family-name:var(--font-body)] text-sm font-semibold text-white"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-ink-secondary hover:bg-primary-light hover:text-primary rounded-[var(--radius-input)] px-4 py-3 font-[family-name:var(--font-body)] text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="bg-primary mt-2 rounded-[var(--radius-button)] px-4 py-3 text-center font-[family-name:var(--font-body)] text-sm font-semibold text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
