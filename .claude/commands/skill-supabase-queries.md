# Skill: Supabase Queries (Next.js)

## Two Clients

All queries go through one of two Supabase clients depending on context:

```ts
// Client Components / React Query hooks
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server Components / Server Actions / Route Handlers
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

Both are typed with the auto-generated `Database` type from `src/types/supabase.ts`.

## Services Accept Client Parameter

Services do NOT import a global client. They accept a `SupabaseClient` parameter:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export async function fetchProducts(
  client: SupabaseClient<Database>,
): Promise<Product[]> {
  const { data, error } = await client
    .from('products')
    .select('*')
  if (error) throw new Error(error.message)
  return data
}
```

This lets the same service work in:
- **Server Components**: pass the server client
- **Client hooks**: pass the browser client
- **Server Actions**: pass the server client

## Type Extraction

Use generated types for all queries:

```ts
import type { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
```

## Error Checking (MANDATORY)

Supabase does NOT throw on errors -- it returns `{ data, error }`. **Every query MUST check the error field:**

```ts
// CORRECT
const { data, error } = await client.from('products').select('*')
if (error) throw new Error(error.message)
return data

// WRONG -- ignoring error
const { data } = await client.from('products').select('*')
return data // Could be null if there was an error
```

## Chain `.select()` After Mutations (MANDATORY)

`.insert()` and `.update()` return `null` data by default. **Always chain `.select()` to get the returned record:**

```ts
// CORRECT
const { data, error } = await client
  .from('products')
  .insert(payload)
  .select()
  .single()

// WRONG -- data will be null
const { data, error } = await client
  .from('products')
  .insert(payload)
  .single()
```

## Common Query Patterns

### Fetch all (with ordering)

```ts
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
```

### Fetch single by ID

```ts
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
```

### Fetch with filters

```ts
export async function fetchActiveProducts(
  client: SupabaseClient<Database>,
): Promise<Product[]> {
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('is_active', true)
    .gte('price', 10)
    .order('price', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}
```

### Insert

```ts
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
```

### Update

```ts
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
```

### Delete

```ts
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

## Relations (Foreign Key Joins)

```ts
const { data, error } = await client
  .from('orders')
  .select(`
    *,
    order_items (*),
    profiles (name, email)
  `)
  .eq('id', orderId)
  .single()
```

### Nested relations

```ts
const { data, error } = await client
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      products (title, price)
    )
  `)
```

## Pagination

```ts
export async function fetchProductsPaginated(
  client: SupabaseClient<Database>,
  page: number,
  pageSize: number = 20,
): Promise<{ data: Product[]; count: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await client
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return { data: data ?? [], count: count ?? 0 }
}
```

## Full-Text Search

```ts
const { data, error } = await client
  .from('products')
  .select('*')
  .textSearch('title', query, { type: 'websearch' })
```

## Realtime Subscriptions

Use in Client Components with the browser client:

```ts
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeProducts() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['products'] })
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [queryClient])
}
```

## Not-Found Handling (PGRST116)

```ts
export async function fetchProductOrNull(
  client: SupabaseClient<Database>,
  id: string,
): Promise<Product | null> {
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}
```

## RPC (Stored Procedures)

```ts
const { data, error } = await client.rpc('get_monthly_revenue', {
  target_month: '2026-01',
})

if (error) throw new Error(error.message)
return data
```
