import { cn } from '@/utils/cn'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('relative', containerClassName)}>
        <MagnifyingGlassIcon className="text-ink-tertiary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <input
          ref={ref}
          type="search"
          placeholder="Search accommodations, vans, or places..."
          className={cn(
            'border-border bg-surface text-ink shadow-card placeholder:text-ink-tertiary focus:border-primary focus:shadow-glow/30 focus-visible:ring-primary block w-full rounded-[var(--radius-button)] border py-4 pr-4 pl-12 font-[family-name:var(--font-body)] text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)

SearchBar.displayName = 'SearchBar'
