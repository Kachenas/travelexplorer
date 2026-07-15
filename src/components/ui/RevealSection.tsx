'use client'

import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { fadeUp, premium } from '@/utils/motion'
import type { ReactNode } from 'react'

interface RevealSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function RevealSection({ children, className, delay = 0 }: RevealSectionProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      transition={{ ...premium, delay }}
    >
      {children}
    </motion.div>
  )
}
