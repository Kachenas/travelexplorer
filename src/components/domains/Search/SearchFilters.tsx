'use client'

import { useUIStore } from '@/components/providers/UIStoreProvider'
import { Button } from '@/components/ui/Button'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

const loopOptions = [
  { value: '', label: 'All Loops' },
  { value: 'Cordillera', label: 'Cordillera' },
  { value: 'Ilocos', label: 'Ilocos' },
  { value: 'Bicol', label: 'Bicol' },
  { value: 'Metro Manila', label: 'Metro Manila' },
]

export function SearchFilters() {
  const router = useRouter()
  const searchFilters = useUIStore((s) => s.searchFilters)
  const setFilter = useUIStore((s) => s.setFilter)

  function handleSearch() {
    const params = new URLSearchParams()
    if (searchFilters.loop) params.set('loop', searchFilters.loop)
    if (searchFilters.passengers > 1) params.set('passengers', String(searchFilters.passengers))
    if (searchFilters.startDate) params.set('start', searchFilters.startDate)
    if (searchFilters.endDate) params.set('end', searchFilters.endDate)
    if (searchFilters.location) params.set('location', searchFilters.location)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-surface shadow-float rounded-[var(--radius-card)] p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <label htmlFor="loop" className="text-ink-secondary block text-sm font-medium">
            Travel Loop
          </label>
          <select
            id="loop"
            value={searchFilters.loop ?? ''}
            onChange={(e) => setFilter('loop', e.target.value || null)}
            className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
          >
            {loopOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="passengers" className="text-ink-secondary block text-sm font-medium">
            Passengers
          </label>
          <input
            id="passengers"
            type="number"
            min={1}
            max={30}
            value={searchFilters.passengers}
            onChange={(e) => setFilter('passengers', Math.max(1, Number(e.target.value)))}
            className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="start-date" className="text-ink-secondary block text-sm font-medium">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={searchFilters.startDate ?? ''}
            onChange={(e) => setFilter('startDate', e.target.value || null)}
            className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="end-date" className="text-ink-secondary block text-sm font-medium">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={searchFilters.endDate ?? ''}
            onChange={(e) => setFilter('endDate', e.target.value || null)}
            className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleSearch} size="lg" className="w-full">
            <MagnifyingGlassIcon className="mr-2 h-5 w-5" />
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}
