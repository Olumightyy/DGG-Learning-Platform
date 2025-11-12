import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "instructor") {
      redirect("/instructor/dashboard")
    } else {
      redirect("/student/dashboard")
    }
  }

  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-[#512d7c]/15 via-[#512d7c]/10 to-transparent" />
        <div className="absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-[#f2b42c]/30 blur-3xl" />
        <div className="absolute -left-10 top-40 h-64 w-64 rounded-full bg-[#512d7c]/20 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-20 w-full border-b bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="./Logoo.jpg"
              alt="D Global Growthfield logo"
              width={200}
              height={100}
              className="h-9 w-9"
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-[#512d7c]">
              D Global Growthfield
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://www.dglobalgrowthfield.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-[#512d7c] hover:bg-[#512d7c]/10 sm:inline-block"
              aria-label="Visit D Global Growthfield website (opens in a new tab)"
            >
              Visit D Global Growthfield ↗
            </a>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-[#512d7c] hover:bg-[#512d7c]/10">
                Log in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-[#512d7c] text-white hover:bg-[#3f2361]">
                Start learning
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 md:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#512d7c]/20 bg-[#512d7c]/5 px-3 py-1 text-sm text-[#512d7c]">
              Built for DGG students
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Build{" "}
              <span className="bg-gradient-to-r from-[#512d7c] to-[#6d42a3] bg-clip-text text-transparent">
                real tech skills
              </span>{" "}
              with D Global Growthfield
            </h1>
            <p className="text-lg text-gray-600">
              Learn from curated video lessons, practice with assignments, and submit your work for feedback.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-[#512d7c] text-white hover:bg-[#3f2361]">
                  Start learning
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#512d7c] text-[#512d7c] hover:bg-[#512d7c]/10"
                >
                  Log in
                </Button>
              </Link>
              <a href="#features">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100"
                >
                  Learn more
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-4 pt-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#f2b42c]" />
                Simple to start
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#512d7c]" />
                Scales with your classes
              </div>
            </div>
          </div>

          {/* Hero image / mockup */}
          <div className="relative">
            <div className="relative rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
              <Image
                src="./placegolder.jpg"
                alt="DGG Learning Platform preview"
                width={1280}
                height={720}
                className="rounded-lg ring-1 ring-gray-200"
                priority
              />
              <div className="pointer-events-none absolute -left-6 -top-6 h-16 w-16 -rotate-12 rounded-lg bg-[#f2b42c]/40 blur-lg" />
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-16 w-16 rotate-12 rounded-lg bg-[#512d7c]/30 blur-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to teach and learn
          </h2>
          <p className="mt-3 text-gray-600">
            Built for tech courses with clear lessons, assignments, and file submissions.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "YouTube lessons",
              desc: "Watch embedded videos with titles, descriptions, and modules.",
              emoji: "🎥",
            },
            {
              title: "Assignments",
              desc: "Clear instructions, due dates, and linked lessons.",
              emoji: "📝",
            },
            {
              title: "Submissions",
              desc: "Upload code, docs, and zips — automatically timestamped.",
              emoji: "📤",
            },
            {
              title: "Instructor tools",
              desc: "Create assignments, review work, and manage feedback.",
              emoji: "🧑‍🏫",
            },
            {
              title: "Secure access",
              desc: "Role-based login for students and instructors.",
              emoji: "🔐",
            },
            {
              title: "Scalable",
              desc: "Next.js + Supabase for performance and growth.",
              emoji: "⚡",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#512d7c]/10 text-xl">
                <span>{f.emoji}</span>
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
              <div className="mt-4 h-1 w-10 rounded-full bg-[#f2b42c]/70 transition-all group-hover:w-20" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="rounded-2xl border border-[#512d7c]/15 bg-[#512d7c]/5 p-8">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create or join",
                desc: "Sign up to access your DGG courses and materials.",
              },
              {
                step: "2",
                title: "Learn",
                desc: "Watch lessons and review resources for each module.",
              },
              {
                step: "3",
                title: "Submit",
                desc: "Upload your files and track your submission status.",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f2b42c] font-bold text-gray-900">
                  {s.step}
                </div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 ring-1 ring-gray-200">
            <p className="text-sm text-gray-700">
              Ready to get started? Create an account and start learning today.
            </p>
            <div className="flex gap-3">
              <Link href="/auth/sign-up">
                <Button className="bg-[#512d7c] text-white hover:bg-[#3f2361]">
                  Start learning
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-[#512d7c] text-[#512d7c] hover:bg-[#512d7c]/10"
                >
                  I already have an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <Image src="./Logoo.jpg" alt="D Global Growthfield logo" width={24} height={24} />
            <span className="text-sm font-medium text-[#512d7c]">D Global Growthfield</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.dglobalgrowthfield.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[#512d7c] hover:underline"
            >
              Visit dglobalgrowthfield.com ↗
            </a>
          </div>
          <p className="text-center text-xs text-gray-500 sm:text-right">
            © {new Date().getFullYear()} Powered by Calex Digital
          </p>
        </div>
      </footer>
    </div>
  )
}