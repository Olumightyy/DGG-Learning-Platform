import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "instructor") {
    redirect("/student/dashboard")
  }

  const handleLogout = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <nav className="lg:hidden sticky top-0 z-20 w-full border-b border-[#512d7c]/15 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/instructor/dashboard" className="text-lg font-bold text-[#512d7c]">
            DGG Learning
          </Link>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#512d7c] hover:bg-[#512d7c]/10 [&::-webkit-details-marker]:hidden">
              Menu
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-[#512d7c]">
                <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-64 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
              <div className="flex flex-col">
                <Link href="/instructor/dashboard" className="rounded px-3 py-2 text-sm hover:bg-gray-100">Dashboard</Link>
                <Link href="/instructor/materials" className="rounded px-3 py-2 text-sm hover:bg-gray-100">Materials</Link>
                <Link href="/instructor/assignments" className="rounded px-3 py-2 text-sm hover:bg-gray-100">Assignments</Link>
                <Link href="/instructor/materials/new" className="rounded px-3 py-2 text-sm hover:bg-gray-100">+ New Course</Link>
                <Link href="/instructor/assignments/new" className="rounded px-3 py-2 text-sm hover:bg-gray-100">+ New Assignment</Link>
                <a
                  href="https://www.dglobalgrowthfield.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded px-3 py-2 text-sm text-[#512d7c] hover:bg-[#512d7c]/10"
                >
                  Visit D Global Growthfield ↗
                </a>
                <div className="my-1 border-t" />
                <div className="px-3 py-2 text-xs text-gray-500">{user.email}</div>
                <form action={handleLogout} className="px-3 pb-1">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="w-full border-[#512d7c] text-[#512d7c] hover:bg-[#512d7c]/10"
                  >
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </details>
        </div>
      </nav>

      {/* Desktop layout */}
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[260px_1fr] lg:gap-6">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-[100svh] border-r border-[#512d7c]/15 bg-white lg:block">
          <div className="flex h-full flex-col">
            <div className="px-5 py-4">
              <Link href="/instructor/dashboard" className="block text-xl font-bold text-[#512d7c]">
                DGG Learning
              </Link>
              <p className="mt-1 text-xs text-gray-500">Instructor</p>
            </div>

            <nav className="flex-1 space-y-1 px-2">
              <Link href="/instructor/dashboard" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#512d7c]/10">
                Dashboard
              </Link>
              <Link href="/instructor/materials" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#512d7c]/10">
                Materials
              </Link>
              <Link href="/instructor/assignments" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#512d7c]/10">
                Assignments
              </Link>

              <div className="pt-3">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Create</p>
                <Link href="/instructor/materials/new" className="block rounded-md px-3 py-2 text-sm font-medium text-[#512d7c] hover:bg-[#512d7c]/10">
                  + New Course
                </Link>
                <Link href="/instructor/assignments/new" className="block rounded-md px-3 py-2 text-sm font-medium text-[#512d7c] hover:bg-[#512d7c]/10">
                  + New Assignment
                </Link>
              </div>
            </nav>

            <div className="border-t border-gray-200 p-4">
              <a
                href="https://www.dglobalgrowthfield.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md px-3 py-2 text-sm font-medium text-[#512d7c] hover:bg-[#512d7c]/10"
              >
                Visit D Global Growthfield ↗
              </a>
              <div className="mt-3 rounded-md bg-[#512d7c]/5 p-3 text-xs text-gray-600">
                <div className="truncate">{user.email}</div>
              </div>
              <form action={handleLogout} className="mt-3">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full border-[#512d7c] text-[#512d7c] hover:bg-[#512d7c]/10"
                >
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="px-4 py-6 sm:px-6 lg:px-0 lg:py-8">{children}</main>
      </div>
    </div>
  )
}