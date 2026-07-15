import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { UIStoreProvider } from '@/components/providers/UIStoreProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Luzon Explore — Premium Road Trip Marketplace',
  description:
    'Discover Luzon. Book vans with drivers, find boutique accommodations, and build unforgettable road trip itineraries across the Philippines.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <UIStoreProvider>{children}</UIStoreProvider>
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
