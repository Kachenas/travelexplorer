# Skill: Next.js App Router

## Framework

- **Next.js 15 App Router** (file-system based routing)
- Route protection via **middleware** (`middleware.ts`)
- No client-side route guards -- middleware handles all auth redirects server-side
- Route groups `(parentheses)` for organizational grouping

## File Conventions

| File | Purpose |
| ---- | ------- |
| `page.tsx` | Route UI (required to make a route accessible) |
| `layout.tsx` | Shared layout wrapping child routes (persists across navigation) |
| `loading.tsx` | Loading UI (shown while page content loads) |
| `error.tsx` | Error boundary (`'use client'` required) |
| `not-found.tsx` | 404 UI for the route segment |

## Route Groups

Route groups organize routes without affecting the URL structure:

```
src/app/
├── (auth)/              # Auth pages (login, register) -- no layout chrome
│   ├── login/
│   │   └── page.tsx     # /login
│   ├── register/
│   │   └── page.tsx     # /register
│   └── layout.tsx       # Minimal layout for auth pages
├── (dashboard)/         # Protected pages -- shared dashboard layout
│   ├── dashboard/
│   │   └── page.tsx     # /dashboard
│   ├── products/
│   │   ├── page.tsx     # /products
│   │   └── [id]/
│   │       └── page.tsx # /products/:id
│   └── layout.tsx       # Dashboard sidebar + nav layout
├── layout.tsx           # Root layout (Providers, Toaster)
└── page.tsx             # / (home page)
```

The `(auth)` and `(dashboard)` groups let you apply different layouts without adding URL segments.

## Middleware Route Protection

All route protection is handled in `middleware.ts` -- no client-side guards needed:

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Use getUser() not getSession() for secure auth checks
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes -- redirect to login if unauthenticated
  const protectedPaths = ['/dashboard', '/products', '/settings']
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Auth pages -- redirect to dashboard if already authenticated
  const authPaths = ['/login', '/register']
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Adding a New Protected Route

1. Add the path to the `protectedPaths` array in `middleware.ts`
2. Create the route directory and `page.tsx` under the appropriate route group

### Role-Based Protection

For role-based access, check user metadata in middleware:

```ts
// After getUser() check
if (request.nextUrl.pathname.startsWith('/admin')) {
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  // Check role from user metadata or profiles table
  // For simple cases, use user_metadata set during signup
  if (user.user_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

## Layout Components

Layouts wrap child routes and persist across navigation:

```tsx
// src/app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/domains/Dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  )
}
```

## Navigation

### Link Component

```tsx
import Link from 'next/link'

<Link href="/products" className="text-blue-500 hover:underline">Products</Link>

// Active state styling (use pathname comparison)
<Link
  href="/dashboard"
  className={cn(
    'px-3 py-2 rounded-lg text-sm',
    pathname === '/dashboard' ? 'bg-blue-500/10 text-blue-500' : 'text-gray-600'
  )}
>
  Dashboard
</Link>
```

### Programmatic Navigation

```tsx
'use client'

import { useRouter } from 'next/navigation'

function ProductCard({ product }: { product: Product }) {
  const router = useRouter()

  return (
    <button onClick={() => router.push(`/products/${product.id}`)}>
      View Details
    </button>
  )
}
```

### Server-Side Redirect

```ts
import { redirect } from 'next/navigation'

// In Server Components or Server Actions
redirect('/dashboard')
```

## Dynamic Routes

```
src/app/(dashboard)/products/[id]/page.tsx
```

```tsx
// src/app/(dashboard)/products/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import * as productService from '@/services/ProductService'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  try {
    const product = await productService.fetchProduct(supabase, id)
    return <div>{product.title}</div>
  } catch {
    notFound()
  }
}
```

## Loading UI

```tsx
// src/app/(dashboard)/products/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-gray-400">Loading...</div>
    </div>
  )
}
```

## Error Boundary

```tsx
// src/app/(dashboard)/products/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold text-red-500">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
```

## Adding a New Route

1. Create the directory under the appropriate route group
2. Add `page.tsx` (Server Component by default)
3. If protected, ensure the path is in `middleware.ts` `protectedPaths`
4. If it needs a layout, add `layout.tsx` to the route group
5. If using React Query on the client, use HydrationBoundary for prefetching

```tsx
// 1. Create page (Server Component)
// src/app/(dashboard)/settings/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p>Email: {user?.email}</p>
    </div>
  )
}

// 2. Add to middleware protectedPaths
const protectedPaths = ['/dashboard', '/products', '/settings']
```
