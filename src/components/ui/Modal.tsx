'use client'

import { cn } from '@/utils/cn'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50" static>
          <motion.div
            className="bg-overlay fixed inset-0 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className={cn(
                  'bg-surface shadow-float mx-auto w-full max-w-lg rounded-[var(--radius-card)] p-8',
                  className,
                )}
              >
                <div className="flex items-start justify-between">
                  {title && (
                    <DialogTitle className="text-ink font-[family-name:var(--font-display)] text-3xl font-bold">
                      {title}
                    </DialogTitle>
                  )}
                  <button
                    onClick={onClose}
                    className="text-ink-tertiary hover:bg-surface-alt hover:text-ink focus-visible:ring-primary ml-auto rounded-full p-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6">{children}</div>
              </motion.div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
