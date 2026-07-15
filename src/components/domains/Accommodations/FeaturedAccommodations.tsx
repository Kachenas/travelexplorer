'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AccommodationCard } from './AccommodationCard'
import { BookingModal } from '@/components/domains/Bookings/BookingModal'
import { staggerContainer, fadeUp, premium } from '@/utils/motion'
import type { Database } from '@/types/supabase'

type Accommodation = Database['public']['Tables']['accommodations']['Row']

interface FeaturedAccommodationsProps {
  accommodations: Accommodation[]
}

export function FeaturedAccommodations({ accommodations }: FeaturedAccommodationsProps) {
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)

  return (
    <>
      <motion.div
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        {accommodations.map((accommodation) => (
          <motion.div key={accommodation.id} variants={fadeUp} transition={premium}>
            <AccommodationCard accommodation={accommodation} onBook={setSelectedAccommodation} />
          </motion.div>
        ))}
      </motion.div>

      {selectedAccommodation && (
        <BookingModal
          isOpen={!!selectedAccommodation}
          onClose={() => setSelectedAccommodation(null)}
          listing={{
            id: selectedAccommodation.id,
            name: selectedAccommodation.name,
            type: 'hotel',
            pricePerUnit: Number(selectedAccommodation.price_per_night),
            unitLabel: 'night',
          }}
        />
      )}
    </>
  )
}
