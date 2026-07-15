'use client'

import Link from 'next/link'
import { cn } from '@/utils/cn'

interface SearchSidebarProps {
  currentType?: string
  currentLoop?: string
}

const typeFilters = [
  { value: undefined, label: 'All' },
  { value: 'van', label: 'Van Rentals' },
  { value: 'hotel', label: 'Accommodations' },
  { value: 'tour', label: 'Tours' },
]

const loopFilters = [
  { value: undefined, label: 'All Loops' },
  { value: 'Cordillera', label: 'Cordillera' },
  { value: 'Ilocos', label: 'Ilocos' },
  { value: 'Bicol', label: 'Bicol' },
  { value: 'Metro Manila', label: 'Metro Manila' },
]

function buildHref(type?: string, loop?: string) {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (loop) params.set('loop', loop)
  const qs = params.toString()
  return `/search${qs ? `?${qs}` : ''}`
}

export function SearchSidebar({ currentType, currentLoop }: SearchSidebarProps) {
  return (
    <div className="p-6">
      {/* Type filters */}
      <div className="mb-8">
        <h3 className="text-ink-tertiary text-xs font-semibold tracking-wider uppercase">Type</h3>
        <div className="mt-4 space-y-1">
          {typeFilters.map((filter) => {
            const isActive = currentType === filter.value
            return (
              <Link
                key={filter.label}
                href={buildHref(filter.value, currentLoop)}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-ink-secondary hover:bg-primary-light hover:text-primary',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 flex-shrink-0 rounded-full border-2',
                    isActive ? 'border-white bg-white' : 'border-ink-faint',
                  )}
                />
                {filter.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Loop filters */}
      <div>
        <h3 className="text-ink-tertiary text-xs font-semibold tracking-wider uppercase">Region</h3>
        <div className="mt-4 space-y-1">
          {loopFilters.map((filter) => {
            const isActive = currentLoop === filter.value
            return (
              <Link
                key={filter.label}
                href={buildHref(currentType, filter.value)}
                className={cn(
                  'flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-ink-secondary hover:bg-primary-light hover:text-primary',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 flex-shrink-0 rounded-full border-2',
                    isActive ? 'border-white bg-white' : 'border-ink-faint',
                  )}
                />
                {filter.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
