import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do not use getSession() -- it reads from storage without
  // validating the JWT. Use getUser() for server-side auth checks.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Clear stale auth cookies when there is no valid session.
  // This prevents "Expected 3 parts in JWT" errors on public pages
  // caused by leftover malformed tokens from a previous sign-out.
  if (!user) {
    const authCookies = request.cookies
      .getAll()
      .filter((c) => c.name.startsWith('sb-'))
    if (authCookies.length > 0) {
      authCookies.forEach(({ name }) => {
        request.cookies.delete(name)
      })
      supabaseResponse = NextResponse.next({ request })
      authCookies.forEach(({ name }) => {
        supabaseResponse.cookies.delete(name)
      })
    }
  }

  // Redirect unauthenticated users away from protected routes
  const protectedPaths = ['/dashboard', '/onboarding', '/vans', '/stays', '/tours', '/bookings', '/listings', '/settings', '/admin']
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/register']
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.user_type === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect admin users away from owner dashboard to admin panel
  const ownerPaths = ['/dashboard', '/vans', '/stays', '/tours', '/bookings', '/listings', '/settings']
  const isOwnerPage = ownerPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isOwnerPage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
