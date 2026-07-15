# Allawie -- Claude Configuration

@AGENTS.md

## Stack

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Framework        | Next.js 16.2.10 (App Router, Server Components, Server Actions) |
| Language         | TypeScript 5.9.3 (strict)                        |
| UI Library       | React 19.2.4 (functional components)             |
| Server State     | TanStack React Query 5.101.2 (reads, caching, prefetching) |
| Client State     | Zustand 5.0.14 (UI only, factory + context provider, SSR-safe) |
| Mutations        | Server Actions (`'use server'` + `revalidatePath`) |
| Styling          | Tailwind CSS 4.3.2 (utility-first)               |
| Icons            | Heroicons 2.2.0 (`@heroicons/react`)             |
| Headless UI      | Headless UI 2.2.10 (`@headlessui/react`) for accessible unstyled primitives (Dialog, Menu, Listbox, Combobox, Switch, Tabs, Disclosure, Popover, Transition) |
| Database         | Supabase (PostgreSQL via `@supabase/supabase-js` 2.110.3 + `@supabase/ssr` 0.12.1) |
| Auth             | Supabase Auth (server-side via middleware + `getUser()`) |
| Storage          | Supabase Storage (uploads via Server Actions or direct browser) |
| Realtime         | Supabase Realtime channels                       |
| Migrations       | Supabase CLI 2.109.1 (`supabase migration new` + raw SQL) |
| Type Generation  | Supabase CLI (`supabase gen types typescript`)   |
| Edge Functions   | Supabase Edge Functions (Deno, for webhooks/email) |
| Linting          | ESLint 9.39.5 (Next.js config)                   |
| Formatting       | Prettier 3.9.5 (no semicolons, single quotes, 100 print width) + `prettier-plugin-tailwindcss` 0.8.0 |
| Class Merging    | clsx 2.1.1 + tailwind-merge 3.6.0               |
| Toasts           | sonner 2.0.7                                     |

No Redux, no RTK Query, no redux-persist.
No Zustand auth store -- auth is checked server-side.

## Two Supabase Clients

| Client | Module | Usage |
| ------ | ------ | ----- |
| Browser | `@/lib/supabase/client.ts` | Client Components, React Query hooks |
| Server | `@/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |

```ts
// Browser client (Client Components)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server client (Server Components, Server Actions)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

Both are typed with the generated `Database` type. The server client reads cookies for auth. The browser client uses `@supabase/ssr`'s `createBrowserClient`.

## Folder Structure

```
src/
├── app/                     # Next.js App Router pages and layouts
│   ├── (auth)/              #   Route group for auth pages (login, register)
│   ├── (dashboard)/         #   Route group for protected pages
│   ├── layout.tsx           #   Root layout (Providers, Toaster)
│   ├── page.tsx             #   Home page (Server Component)
│   └── globals.css          #   Tailwind directives
├── actions/                 # Server Actions ('use server' files)
├── components/              # React components
│   ├── ui/                  #   Shared UI primitives (Button, Input, Dialog, etc.)
│   ├── domains/             #   Domain-specific components
│   └── providers/           #   Client-side providers (QueryProvider, StoreProviders)
├── hooks/                   # React Query hooks (reads only, create browser client)
├── lib/
│   ├── supabase/
│   │   ├── client.ts        #   Browser Supabase client (createBrowserClient)
│   │   └── server.ts        #   Server Supabase client (createServerClient)
│   └── query-client.ts      #   React Query client factory (SSR-safe)
├── services/                # Supabase query wrappers (accept SupabaseClient param)
├── stores/                  # Zustand stores (factory + context provider, UI only)
├── types/
│   └── supabase.ts          #   Auto-generated Supabase types -- do NOT edit
└── utils/
    └── cn.ts                #   clsx + tailwind-merge helper
middleware.ts                # Auth token refresh + route protection
supabase/
├── config.toml              # Supabase local config
├── migrations/              # SQL migration files
└── functions/               # Edge Functions (Deno)
```

## Architecture Flow

### Server Path (Server Components)

```
Server Component -> Service(serverClient) -> Supabase -> PostgreSQL
  ↓ prefetch via HydrationBoundary
  ↓ pass user as prop to client components
```

### Client Path (Client Components)

```
Client Component -> Hook (useQuery) -> Service(browserClient) -> Supabase -> PostgreSQL
                                         ^
                                    reads only, cached

Client Component -> Server Action -> Service(serverClient) -> Supabase -> PostgreSQL
                      ^                  + revalidatePath/revalidateTag
                 mutations only

Client Component -> Zustand Store (via Context Provider)
                      ^
                 UI state only (sidebar, modals, theme)
```

1. **Services** (`src/services/`) -- stateless async functions that accept a `SupabaseClient` parameter. Framework-agnostic. Reusable in server components, client hooks, and Server Actions.
2. **Hooks** (`src/hooks/`) -- React Query hooks for reads only (`useQuery`). Create a browser Supabase client and pass to services. No `useMutation`.
3. **Actions** (`src/actions/`) -- Server Actions for mutations. Create a server Supabase client, call services, then `revalidatePath`/`revalidateTag`.
4. **Stores** (`src/stores/`) -- Zustand stores using factory + context provider for SSR safety. UI state only.
5. **Middleware** (`middleware.ts`) -- Refreshes auth tokens and redirects unauthenticated users.

## Server vs Client Component Rules

### Default: Server Components
- All components in the `app/` directory are Server Components by default
- Server Components can: `await` async data, access cookies/headers, read the DB directly
- Server Components cannot: use hooks, event handlers, browser APIs, or state

### `'use client'` Required When:
- Using React hooks (`useState`, `useEffect`, `useQuery`, etc.)
- Using event handlers (`onClick`, `onChange`, `onSubmit`)
- Using browser-only APIs (`window`, `localStorage`)
- Using Zustand stores (via context provider hooks)
- Using React Query hooks

### Rules:
- Push `'use client'` as far down the tree as possible
- Server Components pass data as props to Client Components
- Server Components get `user` via `getUser()` and pass as props
- Never import server-only code in `'use client'` files

## Naming Conventions

### Files
| Type        | Convention               | Example                      |
| ----------- | ------------------------ | ---------------------------- |
| Page        | `page.tsx` in route dir  | `app/(dashboard)/dashboard/page.tsx` |
| Layout      | `layout.tsx` in route dir| `app/(dashboard)/layout.tsx` |
| Server Action| camelCase `*-actions.ts`| `entity-actions.ts`          |
| Component   | PascalCase `.tsx`        | `ProductForm.tsx`            |
| UI primitive| PascalCase in `ui/`      | `ui/Button.tsx`              |
| Hook        | camelCase `use*.ts`      | `useProductQueries.ts`       |
| Store       | camelCase `*-store.ts`   | `ui-store.ts`                |
| Store Provider| PascalCase `*StoreProvider.tsx` | `UIStoreProvider.tsx` |
| Service     | PascalCase `*Service.ts` | `ProductService.ts`          |
| Utility     | camelCase `.ts`          | `cn.ts`                      |

### TypeScript
| Kind              | Convention                        | Example                          |
| ----------------- | --------------------------------- | -------------------------------- |
| Database Row type | From generated `Database` type    | `Database['public']['Tables']['products']['Row']` |
| Insert type       | From generated `Database` type    | `Database['public']['Tables']['products']['Insert']` |
| Update type       | From generated `Database` type    | `Database['public']['Tables']['products']['Update']` |
| Custom interface  | PascalCase (no `I` prefix needed) | `Product`, `Order`               |
| Props interface   | `*Props`                          | `ButtonProps`, `ProductFormProps` |

### Variables & Functions
| Kind             | Convention                                 | Example                          |
| ---------------- | ------------------------------------------ | -------------------------------- |
| Local state      | `useState<T>()` with camelCase             | `const [loading, setLoading] = useState(false)` |
| Boolean state    | `is*`, `show*`, `has*` prefix              | `isScrolled`, `showForm`         |
| Event handlers   | `handle*` or `on*` prefix                  | `handleLogout()`, `onSubmit()`   |
| Query hooks      | `use<Entity>` / `use<Entity>s`             | `useProduct(id)`, `useProducts()` |
| Server Actions   | `<verb><Entity>Action`                     | `createProductAction()`, `deleteProductAction()` |
| Hook export      | `use*`                                     | `useProduct()`, `useEntities()`  |

### Database
| Kind             | Convention                                 | Example                          |
| ---------------- | ------------------------------------------ | -------------------------------- |
| Table names      | lowercase plural `snake_case`              | `products`, `order_items`        |
| Column names     | `snake_case`                               | `created_at`, `user_id`          |
| Primary key      | `id` (UUID)                                | `id UUID PRIMARY KEY`            |
| Foreign key      | `<table>_id`                               | `user_id`, `order_id`            |

### Components
- Always functional components with TypeScript
- Props defined via interface: `interface Props { ... }` or inline
- Use destructuring in function signature: `function Button({ variant, size }: Props)`
- No class components -- always functional with hooks
- Styling: Tailwind utility classes inline via `className` -- avoid CSS modules or styled-components
- Export: default export for pages/layouts, named export for reusable components

## Service Pattern (Accept SupabaseClient Param)

Services are plain async functions that accept a `SupabaseClient` parameter. This makes them usable in any context.

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Product = Database['public']['Tables']['products']['Row']

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

## React Query Hooks (Reads Only)

Hooks use `useQuery` only -- no `useMutation`. They create a browser client and pass it to services.

```ts
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
```

**Key rules:**
- Every domain defines a `keys` object at the top of its hook file
- Query hooks use `useQuery` with `queryKey` + `queryFn`
- No `useMutation` -- mutations are Server Actions
- Hooks create a browser client and pass to services
- Use `enabled` option to conditionally run queries
- Components access `data`, `isPending`, `error` from query hooks
- Entity identification uses `id` (UUID from PostgreSQL), NOT `_id` (MongoDB ObjectId)

## Server Action Pattern (Mutations)

All mutations use Server Actions. Actions create a server client, call services, and revalidate.

```ts
// src/actions/product-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import * as productService from '@/services/ProductService'

export async function createProductAction(payload: ProductInsert) {
  const supabase = await createClient()
  const product = await productService.createProduct(supabase, payload)
  revalidatePath('/products')
  return product
}
```

**Key rules:**
- File must start with `'use server'`
- Create server client with `await createClient()`
- Call service functions (not Supabase directly)
- Call `revalidatePath` or `revalidateTag` after mutations
- Return data or `{ error: string }` for client-side error handling
- For redirects, use `redirect()` from `next/navigation`

## Zustand Store Pattern (Factory + Context Provider)

Zustand stores use the factory + context provider pattern for SSR safety. No auth store.

```ts
// src/stores/ui-store.ts
import { createStore } from 'zustand/vanilla'

export interface UIState {
  sidebarOpen: boolean
}

export interface UIActions {
  toggleSidebar: () => void
}

export type UIStore = UIState & UIActions

export function createUIStore(initState: Partial<UIState> = {}) {
  return createStore<UIStore>()((set) => ({
    sidebarOpen: true,
    ...initState,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  }))
}
```

```ts
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

**Key rules:**
- No Zustand auth store -- auth is server-side
- Factory function creates the store (`createStore` from `zustand/vanilla`)
- Context provider wraps the tree in a `'use client'` component
- Custom hook uses `useStore` + context for type-safe access
- Use `persist` middleware only for UI preferences (if needed)

## Supabase Auth (Server-Side via Middleware)

- Auth tokens refreshed in `middleware.ts` on every request
- Server Components check auth via `supabase.auth.getUser()` (validates JWT)
- Never use `getSession()` for auth checks -- it reads from storage without validation
- Mutations (sign in, sign out) are Server Actions
- Client Components receive `user` as props from Server Components
- No `onAuthStateChange` listener needed -- middleware handles session refresh

## Supabase Query Patterns

### Always check `{ data, error }`
```ts
const { data, error } = await client.from('products').select('*')
if (error) throw new Error(error.message)
return data
```

### Chain `.select()` after mutations
```ts
const { data, error } = await client
  .from('products')
  .insert(payload)
  .select()
  .single()

if (error) throw new Error(error.message)
return data
```

### Not-found handling (PGRST116)
```ts
if (error) {
  if (error.code === 'PGRST116') return null
  throw new Error(error.message)
}
```

### Relations
```ts
const { data, error } = await client
  .from('orders')
  .select('*, order_items(*), profiles(name, email)')
  .eq('id', orderId)
  .single()
```

## HydrationBoundary (Server Prefetching)

For pages that need React Query on the client with server-prefetched data:

```ts
// Server Component page
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import { createClient } from '@/lib/supabase/server'

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

## Response Handling (No Envelope)

Services return direct data from Supabase -- NOT wrapped in `{ success: true, data: ... }`.

## Routing

- Next.js App Router file conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Route groups with `(parentheses)` for organizational grouping without URL segments
- Route protection via `middleware.ts` (not client-side guards)
- Navigation: `<Link href="/path">`, `useRouter().push('/path')`, `redirect('/path')`
- Dynamic routes: `[id]/page.tsx` with `params` prop

## Styling

- **Framework:** Tailwind CSS 4 -- utility-first, all styling via `className`
- **Headless UI:** `@headlessui/react` for Dialog, Menu, Listbox, Switch, Tabs, Popover
- **No CSS modules** -- Tailwind utilities handle everything
- **Class merging:** Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- **Icons:** Heroicons (`@heroicons/react/24/outline`, `@heroicons/react/24/solid`)
- **Prettier:** `prettier-plugin-tailwindcss` auto-sorts class order

## Error Handling

- Supabase returns `{ data, error }` -- services always check the `error` field and throw
- React Query catches thrown errors and exposes via `error` on query result
- Server Actions return `{ error: string }` for client-side error handling, or use `redirect()`
- Toast notifications for user-facing feedback (`sonner`)

## Migrations & Type Generation

```bash
# Create a new migration
npm run db:migration:new <name>

# Apply migrations locally
npm run db:push

# Reset and re-apply all migrations
npm run db:reset

# Regenerate TypeScript types after schema changes
npm run db:types

# Open Supabase Studio
npm run db:studio
```

## Edge Functions

For server-side logic (webhooks, email sending, payment processing):

```bash
# Create a new Edge Function
npx supabase functions new <name>

# Serve locally
npm run functions:serve

# Deploy to production
npm run functions:deploy
```

Call from a Server Action:
```ts
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' },
})
```

## Environment Variables

| Variable                       | Purpose                     |
| ------------------------------ | --------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon (public) key  |

## Commands

| Command              | Purpose                              |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start Next.js dev server (Turbopack) |
| `npm run build`      | Production build                     |
| `npm run start`      | Start production server              |
| `npm run lint`       | ESLint                               |
| `npm run format`     | Prettier format `src/`               |
| `npm run db:migration:new` | Create a new SQL migration     |
| `npm run db:push`    | Apply migrations locally             |
| `npm run db:reset`   | Reset and re-apply all migrations    |
| `npm run db:types`   | Regenerate TypeScript types          |
| `npm run db:studio`  | Open Supabase Studio                 |
| `npm run supabase:start` | Start local Supabase stack       |
| `npm run supabase:stop`  | Stop local Supabase stack        |
| `npm run functions:serve` | Serve Edge Functions locally    |
| `npm run functions:deploy` | Deploy Edge Functions          |

## `cn()` Utility

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
