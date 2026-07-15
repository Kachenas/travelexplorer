'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import { fadeUp, premium } from '@/utils/motion'

interface LoopCardProps {
  name: string
  description: string
  href: string
  index: number
}

export function LoopCard({ name, description, href, index }: LoopCardProps) {
  return (
    <motion.div variants={fadeUp} transition={{ ...premium, delay: index * 0.1 }}>
      <Link
        href={href}
        className="group bg-surface shadow-card hover:shadow-card-hover block rounded-[var(--radius-card)] p-8 transition-all duration-300 hover:-translate-y-1.5"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
            {name}
          </h3>
          <ArrowUpRightIcon className="text-primary h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
        <p className="text-ink-secondary mt-3 text-sm leading-relaxed">{description}</p>
      </Link>
    </motion.div>
  )
}
