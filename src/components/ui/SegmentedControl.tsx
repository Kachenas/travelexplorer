'use client'

import { cn } from '@/utils/cn'
import { Tab, TabGroup, TabList } from '@headlessui/react'

interface SegmentedControlProps {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
  className?: string
}

export function SegmentedControl({
  items,
  selectedIndex,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <TabGroup selectedIndex={selectedIndex} onChange={onChange}>
      <TabList
        className={cn(
          'border-border bg-surface-alt inline-flex rounded-[var(--radius-button)] border p-1',
          className,
        )}
      >
        {items.map((item, i) => (
          <Tab
            key={item}
            className={cn(
              'focus-visible:ring-primary rounded-[var(--radius-input)] px-5 py-2.5 font-[family-name:var(--font-body)] text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
              selectedIndex === i
                ? 'bg-primary text-white shadow-sm'
                : 'text-ink-secondary hover:text-ink',
            )}
          >
            {item}
          </Tab>
        ))}
      </TabList>
    </TabGroup>
  )
}
