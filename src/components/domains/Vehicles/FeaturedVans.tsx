'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { VehicleCard } from './VehicleCard'
import { BookingModal } from '@/components/domains/Bookings/BookingModal'
import { staggerContainer, fadeUp, premium } from '@/utils/motion'
import type { Database } from '@/types/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']

interface FeaturedVansProps {
  vehicles: Vehicle[]
}

export function FeaturedVans({ vehicles }: FeaturedVansProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  return (
    <>
      <motion.div
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
      >
        {vehicles.map((vehicle) => (
          <motion.div key={vehicle.id} variants={fadeUp} transition={premium}>
            <VehicleCard vehicle={vehicle} onBook={setSelectedVehicle} />
          </motion.div>
        ))}
      </motion.div>

      {selectedVehicle && (
        <BookingModal
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          listing={{
            id: selectedVehicle.id,
            name: selectedVehicle.name,
            type: 'van',
            pricePerUnit: Number(selectedVehicle.daily_rate),
            unitLabel: 'day',
          }}
        />
      )}
    </>
  )
}
