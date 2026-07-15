'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { cardHover } from '@/utils/motion'
import type { Database } from '@/types/supabase'

type Tour = Database['public']['Tables']['tours']['Row']

interface TourCardProps {
  tour: Tour
  onBook?: (tour: Tour) => void
}

export function TourCard({ tour, onBook }: TourCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const images = tour.images?.length ? tour.images : []

  function nextImage() {
    setImageIndex((i) => (i + 1) % images.length)
  }

  function prevImage() {
    setImageIndex((i) => (i - 1 + images.length) % images.length)
  }

  return (
    <motion.div
      className="group bg-surface shadow-card hover:shadow-card-hover overflow-hidden rounded-[var(--radius-card)] transition-shadow duration-300"
      whileHover={cardHover}
    >
      <div className="bg-surface-alt relative aspect-[4/3] overflow-hidden">
        {images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[imageIndex]}
            alt={tour.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-ink-faint flex h-full items-center justify-center">
            <GlobeAltIcon className="h-16 w-16" />
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="bg-surface/90 text-ink hover:bg-surface absolute top-1/2 left-3 -translate-y-1/2 rounded-full p-1.5 shadow-sm backdrop-blur-sm transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="bg-surface/90 text-ink hover:bg-surface absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 shadow-sm backdrop-blur-sm transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </>
        )}
        <Badge variant="inverted" className="absolute top-3 left-3">
          {Number(tour.duration_hours)}h tour
        </Badge>
      </div>

      <div className="p-6">
        <h3 className="text-ink font-[family-name:var(--font-display)] text-xl font-bold">
          {tour.name}
        </h3>

        <div className="mt-3 space-y-1">
          <div className="text-ink-secondary flex items-center gap-2 text-sm">
            <MapPinIcon className="h-4 w-4" />
            <span>{tour.location}</span>
          </div>
          <div className="text-ink-secondary flex items-center gap-2 text-sm">
            <ClockIcon className="h-4 w-4" />
            <span>{Number(tour.duration_hours)} hours</span>
            <span className="text-ink-faint">&middot;</span>
            <UserGroupIcon className="h-4 w-4" />
            <span>Max {tour.max_group_size} pax</span>
          </div>
        </div>

        {tour.inclusions && tour.inclusions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tour.inclusions.slice(0, 3).map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        )}

        <div className="border-border mt-6 flex items-end justify-between border-t pt-4">
          <div>
            <span className="text-ink font-[family-name:var(--font-display)] text-2xl font-bold">
              PHP {Number(tour.price_per_person).toLocaleString()}
            </span>
            <span className="text-ink-tertiary ml-1 text-sm">/person</span>
          </div>
          {onBook && (
            <Button size="sm" onClick={() => onBook(tour)}>
              Book
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
