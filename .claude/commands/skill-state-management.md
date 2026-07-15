# Skill: State Management (React Query + Server Actions + Zustand)

## Framework

- **TanStack React Query** -- reads only (caching, fetching, prefetching via HydrationBoundary)
- **Server Actions** -- mutations (`'use server'` + `revalidatePath`/`revalidateTag`)
- **Zustand** -- client-only UI state (factory + context provider, SSR-safe)
- **Supabase** -- services accept a `SupabaseClient` parameter (NOT a global singleton)

No Redux, no RTK Query, no redux-persist, no `useMutation`.

## State Responsibilities

| State Type | Tool | Examples |
| ---------- | ---- | -------- |
| Server data reads | React Query (`useQuery`) | Products list, user profile, order details |
| Server data mutations | Server Actions | Create product, update order, delete item |
| Auth session | Server-side (`getUser()`) | Current user passed as props |
| UI state | Zustand (factory + context) | Sidebar open/closed, theme, modal visibility |
| Form state | `useState` / local | Input values, validation errors |

## Service Layer (Data Access)

Services are plain async functions that accept a `SupabaseClient` parameter. They are framework-agnostic and reusable in any context (server components, client hooks, Server Actions).

```ts
// src/services/ProductService.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export async function fetchProducts(
  client: SupabaseClient<Database>,
): Promise<Product[]> {
  const { data, error } = await client
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function fetchProduct(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Product> {
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createProduct(
  client: SupabaseClient<Database>,
  payload: ProductInsert,
): Promise<Product> {
  const { data, error } = await client
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateProduct(
  client: SupabaseClient<Database>,
  id: string,
  payload: ProductUpdate,
): Promise<Product> {
  const { data, error } = await client
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteProduct(
  client: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
```

## React Query Hooks (Reads Only)

Hooks create a browser client and pass it to services. No `useMutation`.

### Query Key Convention (MANDATORY)

Every domain defines a `keys` object at the top of its hook file:

```ts
const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
}
```

### Complete Hook Example

```ts
// src/hooks/useProductQueries.ts
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import * as productService from '@/services/ProductService'

const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
}

export function useProducts() {
  const supabase = createClient()
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => productService.fetchProducts(supabase),
  })
}

export function useProduct(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.fetchProduct(supabase, id),
    enabled: !!id,
  })
}
```

### Server Prefetching with HydrationBoundary

```tsx
// Server Component page
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { createClient } from '@/lib/supabase/server'
import * as productService from '@/services/ProductService'

export default async function ProductsPage() {
  const queryClient = getQueryClient()
  const supabase = await createClient()

  await queryClient.prefetchQuery({
    queryKey: ['products'],
    queryFn: () => productService.fetchProducts(supabase),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsContent />
    </HydrationBoundary>
  )
}
```

## Server Action Pattern (Mutations)

All mutations use Server Actions. Actions create a server client, call services, and revalidate.

```ts
// src/actions/product-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import * as productService from '@/services/ProductService'
import type { Database } from '@/types/supabase'

type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export async function createProductAction(payload: ProductInsert) {
  const supabase = await createClient()
  const product = await productService.createProduct(supabase, payload)
  revalidatePath('/products')
  return product
}

export async function updateProductAction(id: string, payload: ProductUpdate) {
  const supabase = await createClient()
  const product = await productService.updateProduct(supabase, id, payload)
  revalidatePath('/products')
  return product
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient()
  await productService.deleteProduct(supabase, id)
  revalidatePath('/products')
}
```

### Calling Server Actions from Components

```tsx
'use client'

import { useState } from 'react'
import { createProductAction } from '@/actions/product-actions'
import { toast } from 'sonner'

export function CreateProductForm() {
  const [title, setTitle] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return
    setPending(true)
    try {
      await createProductAction({ title })
      toast.success('Product created')
      setTitle('')
    } catch {
      toast.error('Failed to create product')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded px-2 py-1"
        placeholder="Product title"
      />
      <button
        onClick={handleSubmit}
        disabled={pending}
        className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        {pending ? 'Creating...' : 'Create'}
      </button>
    </div>
  )
}
```

## Error Handling (MANDATORY)

### In services -- always check Supabase error

```ts
const { data, error } = await client.from('products').select('*')
if (error) throw new Error(error.message)
return data
```

### In Server Actions -- return error or throw

```ts
// Option A: Return error object
export async function createProductAction(payload: ProductInsert) {
  try {
    const supabase = await createClient()
    const product = await productService.createProduct(supabase, payload)
    revalidatePath('/products')
    return product
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Option B: Let it throw (caught by error.tsx boundary)
export async function deleteProductAction(id: string) {
  const supabase = await createClient()
  await productService.deleteProduct(supabase, id)
  revalidatePath('/products')
}
```

### In components -- check returned errors or use try/catch

```ts
const result = await createProductAction(payload)
if ('error' in result) {
  toast.error(result.error)
  return
}
toast.success('Created')
```

## Response Handling (No Envelope)

Services return direct data from Supabase -- NOT wrapped in `{ success, data }`:

```ts
// CORRECT -- service returns entity directly
const product = await productService.createProduct(supabase, data)

// WRONG -- no envelope exists
const { data } = await productService.createProduct(supabase, data)
```

## Zustand Store Pattern (Factory + Context Provider)

Zustand stores use the factory + context provider pattern for SSR safety. **No auth store.**

### Store Factory

```ts
// src/stores/ui-store.ts
import { createStore } from 'zustand/vanilla'

export interface UIState {
  sidebarOpen: boolean
}

export interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export type UIStore = UIState & UIActions

export function createUIStore(initState: Partial<UIState> = {}) {
  return createStore<UIStore>()((set) => ({
    sidebarOpen: true,
    ...initState,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
  }))
}
```

### Context Provider

```tsx
// src/components/providers/UIStoreProvider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'
import { createUIStore, type UIStore } from '@/stores/ui-store'

type UIStoreApi = ReturnType<typeof createUIStore>
const UIStoreContext = createContext<UIStoreApi | undefined>(undefined)

export function UIStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<UIStoreApi>(undefined)
  if (!storeRef.current) {
    storeRef.current = createUIStore()
  }
  return (
    <UIStoreContext.Provider value={storeRef.current}>
      {children}
    </UIStoreContext.Provider>
  )
}

export function useUIStore<T>(selector: (store: UIStore) => T): T {
  const ctx = useContext(UIStoreContext)
  if (!ctx) throw new Error('useUIStore must be used within UIStoreProvider')
  return useStore(ctx, selector)
}
```

### Accessing in Components

```tsx
'use client'

import { useUIStore } from '@/components/providers/UIStoreProvider'

function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  // ...
}
```

## Rules Summary

1. Server data reads go in React Query (`useQuery`) -- NOT Zustand
2. Mutations use Server Actions -- NOT `useMutation`
3. Client-only UI state goes in Zustand (factory + context) -- NOT React Query
4. Auth is server-side (`getUser()`) -- NO Zustand auth store
5. Services accept a `SupabaseClient` parameter (no global singleton)
6. React Query hooks create a browser client and pass to services
7. Server Actions create a server client and pass to services
8. Every hook file defines a `keys` object for query key management
9. Server Actions call `revalidatePath`/`revalidateTag` after mutations
10. Entity identification uses `id` (UUID from PostgreSQL), NOT `_id` (MongoDB ObjectId)
11. Components use `isPending`/`error` from React Query -- no manual `useState` for loading/error on reads
