# Skill: React Components (Next.js)

## Component Rules

- **Always functional components** -- never class components
- **TypeScript** for all components
- Props defined via `interface` (suffix `Props` for reusable components)
- Use destructuring in function signature
- **No CSS modules or styled-components** -- Tailwind utility classes via `className`
- Default export for pages/layouts, named export for reusable components

## Server vs Client Component Decision Tree

1. **Does it use hooks, event handlers, or browser APIs?** → `'use client'`
2. **Does it only display data passed as props?** → Server Component (default)
3. **Does it fetch data with `await`?** → Server Component
4. **Does it need `useState`, `useEffect`, `useQuery`?** → `'use client'`
5. **Does it use Zustand stores?** → `'use client'`

### `'use client'` Rules

- Add `'use client'` at the **top of the file** (before imports)
- Push `'use client'` as far **down** the component tree as possible
- A `'use client'` component can import other client components (they inherit)
- A `'use client'` component **cannot** import server-only code
- Server Components pass data as **props** to Client Components

```tsx
// Server Component (default) -- fetches data
// src/app/(dashboard)/products/page.tsx
import { createClient } from '@/lib/supabase/server'
import * as productService from '@/services/ProductService'
import { ProductList } from '@/components/domains/Products/ProductList'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const products = await productService.fetchProducts(supabase)

  return <ProductList products={products} user={user!} />
}
```

```tsx
// Client Component -- uses hooks and event handlers
// src/components/domains/Products/ProductList.tsx
'use client'

import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

interface ProductListProps {
  products: Product[]
  user: User
}

export function ProductList({ products, user }: ProductListProps) {
  const [search, setSearch] = useState('')
  // ...
}
```

## Entity Identification: `id` (UUID), NOT `_id`

All entities use `id` (UUID from PostgreSQL), not `_id` (MongoDB ObjectId):

```tsx
// CORRECT -- PostgreSQL UUID
interface Product {
  id: string
  title: string
  price: number
  created_at: string
}

// Usage
products.map((product) => (
  <ProductCard key={product.id} product={product} />
))

// WRONG -- MongoDB ObjectId
interface Product {
  _id: string  // NEVER use _id
}
```

## Component File Structure

```tsx
// 1. 'use client' directive (only if needed)
'use client'

// 2. Imports (React, libraries, hooks, components, utils, types)
import { useState, useCallback } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useProducts } from '@/hooks/useProductQueries'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// 3. Props interface
interface ProductCardProps {
  product: Product
  onEdit?: (id: string) => void
  className?: string
}

// 4. Component function
export function ProductCard({ product, onEdit, className }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleEdit = useCallback(() => {
    onEdit?.(product.id)
  }, [onEdit, product.id])

  return (
    <div className={cn('rounded-xl border border-gray-100 bg-white p-4 shadow-sm', className)}>
      <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
      <p className="mt-1 text-sm text-gray-500">${product.price}</p>
      <button onClick={handleEdit} className="mt-2 text-sm text-blue-500 hover:underline">
        Edit
      </button>
    </div>
  )
}
```

## Page Components (Server Components)

```tsx
// src/app/(dashboard)/products/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { createClient } from '@/lib/supabase/server'
import * as productService from '@/services/ProductService'
import { ProductsContent } from '@/components/domains/Products/ProductsContent'

export default async function ProductsPage() {
  const queryClient = getQueryClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await queryClient.prefetchQuery({
    queryKey: ['products'],
    queryFn: () => productService.fetchProducts(supabase),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsContent user={user!} />
    </HydrationBoundary>
  )
}
```

## UI Primitive Components

Located in `src/components/ui/`:

### Button

```tsx
// src/components/ui/Button.tsx
'use client'

import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        variant === 'primary' && 'bg-blue-500 text-white shadow-sm hover:bg-blue-600',
        variant === 'secondary' && 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100',
        (disabled || loading) && 'cursor-not-allowed opacity-50',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}
```

### Input

```tsx
// src/components/ui/Input.tsx
'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all',
            'placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-200',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
```

## Children Pattern

```tsx
interface CardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-100 bg-white p-6 shadow-sm', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}
```

## Delete Confirmation with Server Action

```tsx
'use client'

import { useState } from 'react'
import { deleteProductAction } from '@/actions/product-actions'
import { toast } from 'sonner'

function ProductActions({ productId }: { productId: string }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    setPending(true)
    try {
      await deleteProductAction(productId)
      toast.success('Deleted successfully')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setPending(false)
      setShowDeleteDialog(false)
    }
  }

  // ...
}
```

## Notifications Pattern

Use `sonner` for user feedback:

```tsx
import { toast } from 'sonner'

// Success
toast.success('Product created successfully')

// Error
toast.error('Failed to create product')
```

## Conditional Rendering

```tsx
{/* Loading state */}
{isPending && <Spinner />}

{/* Error state */}
{error && <div className="text-red-500">{error.message}</div>}

{/* Empty state */}
{items.length === 0 && !isPending && (
  <div className="py-12 text-center text-gray-400">No items found</div>
)}

{/* List rendering -- use id (UUID), NOT _id */}
{items.map((item) => (
  <ProductCard key={item.id} product={item} />
))}
```

## Component Organization

```
src/components/
├── ui/                      # Shared UI primitives (always 'use client')
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Dialog.tsx
│   ├── FileUploader.tsx
│   └── Spinner.tsx
├── domains/                 # Domain-specific components
│   ├── Products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductForm.tsx
│   │   └── ProductsContent.tsx  # Client component with hooks
│   ├── Dashboard/
│   │   └── DashboardContent.tsx
│   └── Auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
└── providers/               # Context providers (always 'use client')
    ├── QueryProvider.tsx
    └── UIStoreProvider.tsx
```

## Export Conventions

- **Pages and Layouts:** `export default` (Next.js convention)
- **UI primitives and domain components:** Named export `export function Button(...)` for tree-shaking
- **Hooks:** Named export `export function useProduct()`
- **Server Actions:** Named export `export async function createProductAction()`
