import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'focus-visible:ring-primary inline-flex cursor-pointer items-center justify-center font-[family-name:var(--font-body)] text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40',
        {
          'bg-primary hover:bg-primary-hover hover:shadow-glow rounded-[var(--radius-button)] text-white shadow-sm active:translate-y-0.5':
            variant === 'primary',
          'border-border bg-surface text-ink hover:border-primary hover:text-primary rounded-[var(--radius-button)] border active:translate-y-0.5':
            variant === 'secondary',
          'text-primary bg-transparent underline-offset-4 hover:underline': variant === 'ghost',
        },
        {
          'px-4 py-2 text-xs': size === 'sm',
          'px-6 py-3 text-sm': size === 'md',
          'px-8 py-4 text-base': size === 'lg',
        },
        className,
      )}
      disabled={disabled}
      {...props}
    />
  )
}
