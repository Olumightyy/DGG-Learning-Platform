// middleware.ts (root)
import { NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Forward request to your session updater
  return updateSession(request)
}

// Keep the same matcher you had in the helper file (or adjust)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
