'use client'

import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { cardHover } from '@/utils/motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <motion.div
      className={cn(
        'bg-surface shadow-card rounded-[var(--radius-card)] transition-shadow',
        hover && 'group',
        className,
      )}
      whileHover={hover ? cardHover : undefined}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function CardStatic({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface shadow-card rounded-[var(--radius-card)]', className)}>
      {children}
    </div>
  )
}
