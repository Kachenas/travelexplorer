'use client'

import { Switch } from '@headlessui/react'
import { cn } from '@/utils/cn'

interface StatusToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label?: string
  disabled?: boolean
}

export function StatusToggle({ enabled, onChange, label, disabled }: StatusToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={enabled}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'focus-visible:ring-primary relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          enabled ? 'bg-primary' : 'bg-ink-faint',
          disabled && 'cursor-not-allowed opacity-40',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-300',
            enabled ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </Switch>
      {label && <span className="text-ink-secondary text-sm font-medium">{label}</span>}
    </div>
  )
}
