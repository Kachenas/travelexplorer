import { cn } from '@/utils/cn'

interface BadgeProps {
  variant?: 'default' | 'inverted'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-badge)] px-2.5 py-1 font-[family-name:var(--font-body)] text-xs font-medium',
        {
          'bg-primary-light text-primary': variant === 'default',
          'bg-primary text-white': variant === 'inverted',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
