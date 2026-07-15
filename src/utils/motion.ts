import type { Variants, Transition } from 'framer-motion'

export const premium: Transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1],
}

export const premiumFast: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
}

export const cardHover = {
  y: -6,
  scale: 1.01,
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
}
