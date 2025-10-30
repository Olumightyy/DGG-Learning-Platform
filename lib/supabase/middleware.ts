import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/auth/confirm',
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Protected routes that need authentication
  const protectedRoutes = [
    '/student',
    '/instructor',
    '/api',
  ]

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // If user is NOT logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', path) // Save where they were trying to go
    return NextResponse.redirect(url)
  }

  // If user IS logged in and trying to access auth pages, redirect to their dashboard
  if (user && path.startsWith('/auth')) {
    // You'll need to check user role here if you want role-based redirects
    // For now, just redirect to a default page
    const url = request.nextUrl.clone()
    url.pathname = '/student/dashboard' // or determine based on user role
    return NextResponse.redirect(url)
  }

  return response
}