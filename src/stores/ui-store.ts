import { createStore } from 'zustand/vanilla'

export interface SearchFilters {
  loop: string | null
  passengers: number
  startDate: string | null
  endDate: string | null
  location: string | null
}

export interface CartItem {
  type: 'van' | 'hotel'
  id: string
  name: string
  pricePerUnit: number
  dates: { start: string; end: string }
}

export interface UIState {
  sidebarOpen: boolean
  searchFilters: SearchFilters
  bookingCart: CartItem[]
}

export interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  resetFilters: () => void
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

export type UIStore = UIState & UIActions

const defaultFilters: SearchFilters = {
  loop: null,
  passengers: 1,
  startDate: null,
  endDate: null,
  location: null,
}

export const defaultUIState: UIState = {
  sidebarOpen: true,
  searchFilters: { ...defaultFilters },
  bookingCart: [],
}

export function createUIStore(initState: UIState = defaultUIState) {
  return createStore<UIStore>()((set) => ({
    ...initState,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setFilter: (key, value) =>
      set((state) => ({
        searchFilters: { ...state.searchFilters, [key]: value },
      })),
    resetFilters: () => set({ searchFilters: { ...defaultFilters } }),
    addToCart: (item) =>
      set((state) => {
        const exists = state.bookingCart.some((c) => c.id === item.id)
        if (exists) return state
        return { bookingCart: [...state.bookingCart, item] }
      }),
    removeFromCart: (id) =>
      set((state) => ({
        bookingCart: state.bookingCart.filter((c) => c.id !== id),
      })),
    clearCart: () => set({ bookingCart: [] }),
  }))
}
