# Skill: React Hooks (Next.js)

## Hook Naming

- File: `src/hooks/use*.ts` (camelCase, always prefixed with `use`)
- Export: named function matching filename (`export function useProducts()`)
- One hook per file (or one hook file per domain with related hooks)

## Two Types of Hooks

### 1. React Query Hooks (Reads Only)

For fetching server data. These create a browser Supabase client, pass it to service functions, and provide caching and loading states. **No `useMutation`** -- mutations are handled by Server Actions.

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

### 2. Composition Hooks (Component Logic)

For combining Zustand stores, local state, and Server Actions into reusable logic units.

```ts
// src/hooks/useProductForm.ts
'use client'

import { useState, useCallback } from 'react'
import { createProductAction } from '@/actions/product-actions'
import { useUIStore } from '@/components/providers/UIStoreProvider'
import { toast } from 'sonner'

export function useProductForm() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  const [title, setTitle] = useState('')
  const [pending, setPending] = useState(false)

  const handleCreate = useCallback(async () => {
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
  }, [title])

  return {
    // Zustand state
    sidebarOpen,
    // Local state
    title, setTitle,
    // Action state
    pending,
    // Actions
    handleCreate,
  }
}
```

## Return Object Order (MANDATORY)

Every composition hook MUST return an object with this grouping order:

1. **Zustand state** (from stores via context providers)
2. **Local state** (component-scoped `useState`)
3. **Query/Action state** (`isPending`, `error`)
4. **Actions** (memoized functions via `useCallback`)

## Browser Client in Hooks

Hooks create a browser Supabase client and pass it to services:

```ts
import { createClient } from '@/lib/supabase/client'

export function useProducts() {
  const supabase = createClient()
  return useQuery({
    queryKey: productKeys.all,
    queryFn: () => productService.fetchProducts(supabase),
  })
}
```

The browser client is created per hook invocation. `createBrowserClient` from `@supabase/ssr` is designed to be called multiple times -- it returns the same singleton instance.

## Error Handling with Server Actions

Server Actions return `{ error: string }` on failure. Handle in the calling component:

```ts
async function handleCreate() {
  setPending(true)
  try {
    const result = await createProductAction(payload)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    toast.success('Product created')
  } catch {
    toast.error('Something went wrong')
  } finally {
    setPending(false)
  }
}
```

For declarative error handling, use the `error` property from React Query:

```ts
const { data, isPending, error } = useProducts()
if (error) return <div>Error: {error.message}</div>
```

## File Handling with Supabase Storage

File uploads can use a Server Action or the browser client directly:

### Via Server Action (recommended for mutations)

```ts
import { useState, useCallback } from 'react'
import { uploadFileAction } from '@/actions/upload-actions'
import { createProductAction } from '@/actions/product-actions'

export function useProductWithUpload() {
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [pending, setPending] = useState(false)

  const create = useCallback(async (title: string) => {
    setPending(true)
    try {
      let coverImageUrl: string | undefined

      if (coverImage) {
        const formData = new FormData()
        formData.append('file', coverImage)
        const uploadResult = await uploadFileAction(formData)
        if ('error' in uploadResult) throw new Error(uploadResult.error)
        coverImageUrl = uploadResult.url
      }

      await createProductAction({
        title,
        cover_image_url: coverImageUrl,
      })
    } finally {
      setPending(false)
    }
  }, [coverImage])

  return {
    coverImage, setCoverImage,
    pending,
    create,
  }
}
```

### Via Browser Client (for direct uploads)

```ts
import { createClient } from '@/lib/supabase/client'
import * as storageService from '@/services/StorageService'

export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const upload = useCallback(async () => {
    if (!file) return
    setUploading(true)
    try {
      const supabase = createClient()
      const url = await storageService.uploadFile(supabase, file)
      return url
    } finally {
      setUploading(false)
    }
  }, [file])

  return { file, setFile, uploading, upload }
}
```

## Common Hook Patterns

### Debounced search

```ts
export function useSearch(delay: number = 300) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), delay)
    return () => clearTimeout(timer)
  }, [query, delay])

  return { query, setQuery, debouncedQuery }
}
```

### Realtime subscription

```ts
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

## Rules Summary

1. React Query hooks for reads only (`useQuery`), no `useMutation`
2. Mutations use Server Actions (called from components or composition hooks)
3. Return order: Zustand state -> local state -> action state -> actions
4. Hooks create a browser client via `createClient()` from `@/lib/supabase/client`
5. File handling uses Supabase Storage via Server Actions or browser client
6. One hook per file (or one file per domain), named `use*.ts`
7. Cleanup effects in `useEffect` return function
8. Use Zustand selectors via context provider hooks
