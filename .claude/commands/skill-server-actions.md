# Skill: Server Actions (Next.js)

## Overview

Server Actions are async functions that execute on the server. They handle all mutations (create, update, delete) in the Next.js + Supabase architecture. They replace `useMutation` from React Query.

## File Convention

- Location: `src/actions/`
- Naming: `<domain>-actions.ts` (e.g., `product-actions.ts`, `auth-actions.ts`)
- Every file starts with `'use server'` directive
- Export individual action functions

## Basic Pattern

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
  revalidatePath(`/products/${id}`)
  return product
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient()
  await productService.deleteProduct(supabase, id)
  revalidatePath('/products')
}
```

## Rules

1. **File must start with `'use server'`** -- this marks all exports as Server Actions
2. **Create server client** with `await createClient()` from `@/lib/supabase/server`
3. **Call service functions** -- actions do NOT call Supabase directly
4. **Revalidate** after mutations with `revalidatePath()` or `revalidateTag()`
5. **Return data** for the client to use, or `{ error: string }` for error handling
6. **Use `redirect()`** from `next/navigation` for post-mutation navigation
7. **Server Actions can accept** plain objects, FormData, or individual parameters

## Error Handling Patterns

### Pattern A: Return error object

Best for forms where you want to display the error in the UI:

```ts
export async function createProductAction(payload: ProductInsert) {
  try {
    const supabase = await createClient()
    const product = await productService.createProduct(supabase, payload)
    revalidatePath('/products')
    return { data: product }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create product' }
  }
}
```

Client usage:

```tsx
async function handleSubmit() {
  const result = await createProductAction(payload)
  if ('error' in result) {
    toast.error(result.error)
    return
  }
  toast.success('Product created')
}
```

### Pattern B: Throw and let error boundary catch

Best for destructive operations where recovery is unlikely:

```ts
export async function deleteProductAction(id: string) {
  const supabase = await createClient()
  await productService.deleteProduct(supabase, id)
  revalidatePath('/products')
}
```

### Pattern C: Redirect after success

Best for auth flows:

```ts
import { redirect } from 'next/navigation'

export async function signInAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
```

## Form Integration

### With FormData

```ts
// Action
export async function createProductAction(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const price = Number(formData.get('price'))

  const product = await productService.createProduct(supabase, { title, price })
  revalidatePath('/products')
  return product
}
```

```tsx
// Component
'use client'

export function CreateProductForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await createProductAction(formData)
      toast.success('Product created')
    } catch {
      toast.error('Failed to create product')
    } finally {
      setPending(false)
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <input name="price" type="number" required />
      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

### With plain objects (programmatic)

```tsx
'use client'

import { createProductAction } from '@/actions/product-actions'

async function handleCreate() {
  setPending(true)
  try {
    await createProductAction({ title, price: Number(price) })
    toast.success('Product created')
  } catch {
    toast.error('Failed to create product')
  } finally {
    setPending(false)
  }
}
```

## Revalidation

### `revalidatePath`

Revalidate all data for a specific path:

```ts
revalidatePath('/products')          // Revalidate the products list page
revalidatePath('/products/[id]', 'page')  // Revalidate a specific product page
revalidatePath('/', 'layout')        // Revalidate everything
```

### `revalidateTag`

Revalidate data tagged during fetch:

```ts
// In service (using Next.js fetch with tags)
const response = await fetch(url, { next: { tags: ['products'] } })

// In action
import { revalidateTag } from 'next/cache'
revalidateTag('products')
```

For Supabase queries (which don't use `fetch` directly), `revalidatePath` is the primary revalidation strategy. React Query on the client will also refetch after `revalidatePath` causes a re-render.

## File Upload via Server Action

```ts
// src/actions/upload-actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadFileAction(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File

  if (!file) {
    return { error: 'No file provided' }
  }

  const filePath = `${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return { error: error.message }
  }

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath)

  return { url: urlData.publicUrl }
}
```

## Auth Actions

```ts
// src/actions/auth-actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }
  return { success: 'Check your email for a confirmation link' }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

## Rules Summary

1. Every action file starts with `'use server'`
2. Actions create a server Supabase client -- never use browser client
3. Actions call service functions -- never call Supabase directly
4. Always `revalidatePath` or `revalidateTag` after mutations
5. Return `{ error: string }` for client-handled errors, or use `redirect()`
6. Actions can accept FormData, plain objects, or individual parameters
7. File uploads via FormData with `formData.get('file') as File`
8. Auth actions use Supabase Auth methods + `redirect()` on success
