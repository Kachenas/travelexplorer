'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TourCard } from './TourCard'
import { BookingModal } from '@/components/domains/Bookings/BookingModal'
import { staggerContainer, fadeUp, premium } from '@/utils/motion'
import type { Database } from '@/types/supabase'

type Tour = Database['public']['Tables']['tours']['Row']

interface FeaturedToursProps {
  tours: Tour[]
}

export function FeaturedTours({ tours }: FeaturedToursProps) {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  return (
    <>
      <motion.div
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        {tours.map((tour) => (
          <motion.div key={tour.id} variants={fadeUp} transition={premium}>
            <TourCard tour={tour} onBook={setSelectedTour} />
          </motion.div>
        ))}
      </motion.div>

      {selectedTour && (
        <BookingModal
          isOpen={!!selectedTour}
          onClose={() => setSelectedTour(null)}
          listing={{
            id: selectedTour.id,
            name: selectedTour.name,
            type: 'tour',
            pricePerUnit: Number(selectedTour.price_per_person),
            unitLabel: 'person',
          }}
        />
      )}
    </>
  )
}
