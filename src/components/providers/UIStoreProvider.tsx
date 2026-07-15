'use client'

import { type ReactNode, createContext, useState, useContext } from 'react'
import { useStore } from 'zustand'
import { createUIStore, type UIStore } from '@/stores/ui-store'

type UIStoreApi = ReturnType<typeof createUIStore>

const UIStoreContext = createContext<UIStoreApi | undefined>(undefined)

export function UIStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createUIStore())

  return <UIStoreContext.Provider value={store}>{children}</UIStoreContext.Provider>
}

export function useUIStore<T>(selector: (store: UIStore) => T): T {
  const storeContext = useContext(UIStoreContext)

  if (!storeContext) {
    throw new Error('useUIStore must be used within UIStoreProvider')
  }

  return useStore(storeContext, selector)
}
