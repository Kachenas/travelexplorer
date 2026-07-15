'use client'

import { motion } from 'framer-motion'
import { LoopCard } from '@/components/domains/Places/LoopCard'
import { staggerContainer } from '@/utils/motion'

const loops = [
  {
    name: 'Cordillera',
    description: 'Baguio, Sagada, Banaue rice terraces, and highland culture',
    href: '/search?loop=Cordillera',
  },
  {
    name: 'Ilocos',
    description: 'Vigan heritage, Pagudpud beaches, La Union surf towns',
    href: '/search?loop=Ilocos',
  },
  {
    name: 'Bicol',
    description: 'Mayon Volcano, CamSur watersports, whale shark diving',
    href: '/search?loop=Bicol',
  },
  {
    name: 'Metro Manila',
    description: 'City tours, Intramuros, museums, and nightlife',
    href: '/search?loop=Metro+Manila',
  },
]

export function LoopsGrid() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={staggerContainer}
    >
      {loops.map((loop, i) => (
        <LoopCard key={loop.name} {...loop} index={i} />
      ))}
    </motion.div>
  )
}
