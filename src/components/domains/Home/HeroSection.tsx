'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { SearchFilters } from '@/components/domains/Search/SearchFilters'

const headline = 'Discover Luzon.'
const words = headline.split(' ')

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <section
      ref={ref}
      className="bg-page relative overflow-hidden px-6 pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      {/* Decorative gradient blob */}
      <motion.div
        className="from-primary/10 to-primary-light/40 absolute -top-10 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br blur-3xl"
        style={{ y: parallaxY }}
      />
      <motion.div
        className="from-primary/5 absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tr to-transparent blur-2xl"
        style={{ y: parallaxY }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Kinetic Typography */}
        <h1 className="text-ink font-[family-name:var(--font-display)] text-6xl leading-[1.05] font-bold tracking-tight sm:text-7xl lg:text-8xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="mr-[0.3em] inline-block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2 + i * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="text-ink-secondary mt-6 max-w-xl font-[family-name:var(--font-body)] text-lg leading-relaxed sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          Book vans with drivers, find accommodations, and explore the best of northern Philippines
          — from Manila to Baguio, La Union, and beyond.
        </motion.p>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <SearchFilters />
        </motion.div>
      </div>
    </section>
  )
}
