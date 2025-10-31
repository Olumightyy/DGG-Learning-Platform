import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public paths
  const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/callback', '/auth/confirm', '/auth/reset-password']
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p))

  // Protected paths
  const protectedPaths = ['/student', '/instructor', '/api']
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))

  // Redirect logic
  if (!user && isProtectedPath) {
    // Not logged in, trying to access protected path
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && (path === '/auth/login' || path === '/auth/signup')) {
    // Logged in, trying to access auth pages
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/student/dashboard' // Default redirect
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
