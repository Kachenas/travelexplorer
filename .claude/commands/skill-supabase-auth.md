# Skill: Supabase Auth (Next.js -- Server-Side)

## Overview

Authentication in Next.js uses **server-side auth** via middleware and Server Actions. There is **no Zustand auth store** and no `onAuthStateChange` listener. The middleware refreshes auth tokens on every request, and Server Components get the user via `getUser()`.

Key differences from the React + Vite architecture:
- **No auth store** -- auth is checked server-side
- **No client-side route guards** -- middleware handles route protection
- **Two Supabase clients** -- browser client for reads, server client for auth operations
- **Server Actions** for sign in, sign up, sign out (not client-side service calls)
- **`getUser()` not `getSession()`** -- `getUser()` validates the JWT server-side

## Middleware (Token Refresh + Route Protection)

The middleware runs on every request. It refreshes the Supabase auth token and protects routes:

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

  // IMPORTANT: Use getUser() -- it validates the JWT
  // Do NOT use getSession() -- it reads from storage without validation
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/dashboard', '/products', '/settings']
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auth pages -- redirect authenticated users
  const authPaths = ['/login', '/register']
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Auth Actions (Server Actions)

All auth operations use Server Actions:

```ts
// src/actions/auth-actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUpAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string | undefined

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: name ? { name } : undefined },
  })

  if (error) return { error: error.message }
  return { success: 'Check your email for a confirmation link' }
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) return { error: error.message }
  return { success: 'Password reset email sent' }
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient()
  const newPassword = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) return { error: error.message }
  return { success: 'Password updated' }
}
```

## Getting User in Server Components

```tsx
// In any Server Component
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Middleware should prevent this, but handle gracefully
    redirect('/login')
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <DashboardContent user={user} />
    </div>
  )
}
```

## Passing User to Client Components

Server Components get the user and pass it as props:

```tsx
// Server Component (page.tsx)
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <DashboardContent user={user!} />
}

// Client Component
'use client'

import type { User } from '@supabase/supabase-js'

export function DashboardContent({ user }: { user: User }) {
  return <p>Email: {user.email}</p>
}
```

## Login Form

```tsx
// src/components/domains/Auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { signInAction } from '@/actions/auth-actions'
import { toast } from 'sonner'
import Link from 'next/link'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await signInAction(formData)
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
    }
    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-500 hover:underline">Sign up</Link>
      </p>
    </form>
  )
}
```

## Sign Out Button

```tsx
'use client'

import { signOutAction } from '@/actions/auth-actions'

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign Out
      </button>
    </form>
  )
}
```

## Role-Based Access

### In Middleware

```ts
if (request.nextUrl.pathname.startsWith('/admin')) {
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user.user_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

### In Server Components

```tsx
export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <AdminDashboard />
}
```

## OAuth Providers (Optional)

```ts
// src/actions/auth-actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signInWithGoogleAction() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}
```

OAuth callback Route Handler:

```ts
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
```

## Profiles Table Pattern

```sql
-- supabase/migrations/<timestamp>_create_profiles.sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

After applying: `npm run db:types`

## Key Differences from React + Vite Auth

| Aspect | React + Vite | Next.js |
| ------ | ----------- | ------- |
| Auth store | Zustand `useAuthStore` | None -- server-side |
| Session sync | `onAuthStateChange` listener | Middleware token refresh |
| Route protection | `ProtectedRoute` component | `middleware.ts` |
| Auth operations | Client-side service calls | Server Actions |
| Getting user | `useAuthStore().user` | `supabase.auth.getUser()` in Server Components |
| Auth check method | `getSession()` | `getUser()` (validates JWT) |
