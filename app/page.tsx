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

  const trainingTiers = [
    {
      title: "Basic Tier",
      features: [
        "3-month training",
        "Digital Literacy",
        "Specialized Course",
        "Digital Monetization",
        "Certificate",
      ],
      label: "Choose Basic",
    },
    {
      title: "Standard Tier",
      features: [
        "6-month training",
        "Expanded curriculum",
        "Portfolio & resume support",
        "Team projects",
        "Standard certificate",
      ],
      label: "Choose Standard",
    },
    {
      title: "Advanced Tier",
      features: [
        "1-year training",
        "Google Certificate",
        "1:1 mentorship",
        "Premium tools & portfolio support",
        "Advanced certificate",
      ],
      label: "Choose Advanced",
    },
  ]

  const trainingStages = [
    {
      name: "Stage 1: Digital Literacy",
      emoji: "📖",
      details: [
        "Computer components basics",
        "Basic OS & software navigation",
        "Internet & browser fundamentals",
        "Online communication & collaboration",
        "AI assistance and prompting",
      ],
    },
    {
      name: "Stage 2: Specialized Skills",
      emoji: "💻",
      details: [
        "Coding (Python, JavaScript, HTML, CSS)",
        "AI & machine learning basics",
        "Data analytics with spreadsheets, SQL, Power BI, Tableau",
        "Digital marketing & online branding",
        "Web design, development & CRM integrations",
      ],
    },
    {
      name: "Stage 3: Digital Monetization",
      emoji: "💰",
      details: [
        "Freelancing on platforms like Upwork",
        "Build online portfolio & resume/CV",
        "Affiliate marketing & e-commerce",
        "Content creation and outreach monetization",
      ],
    },
  ]

  const scrollContainerClasses =
    "flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-1 pb-2 md:grid md:grid-cols-3 md:overflow-visible md:snap-none md:px-0"

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
              width={150}
              height={40}
              className="h-9 w-9"
              style={{ width: "50%", height: "auto" }}
              priority
            />
            <span className="text-lg font-semibold tracking-tight text-[#512d7c]"></span>
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

      {/* Why Choose D-Global Growthfield */}
      <section className="bg-[#f9f9f9] py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#512d7c]">Why Choose D-Global Growthfield?</h2>
          <p className="mb-6 text-gray-700">
            Join us to gain in-demand tech skills, build a professional portfolio, and learn how to monetize your expertise online. Our program offers:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Expert instructors with industry experience.</li>
            <li>Hands-on projects to apply your skills.</li>
            <li>Hybrid learning for flexibility and engagement.</li>
            <li>Certification to boost your career prospects.</li>
            <li>Access to freelancing platforms and job opportunities.</li>
          </ul>
        </div>
      </section>

      {/* Onsite and Online Learning */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#512d7c]">Onsite and Online Learning</h2>
          <p className="mb-6 text-gray-700">
            We offer a hybrid learning model to suit your needs:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>
              <span className="font-bold text-[#512d7c]">Onsite Labs:</span> Hands-on sessions in our state-of-the-art facilities for practical learning.
            </li>
            <li>
              <span className="font-bold text-[#512d7c]">Online Lectures:</span> Access live and recorded classes via Zoom, with assignments on Google Classroom.
            </li>
            <li>
              <span className="font-bold text-[#512d7c]">Collaboration Tools:</span> Use Slack to connect with instructors and peers.
            </li>
          </ul>
        </div>
      </section>
      <section className="bg-[#f9f9f9] py-16 px-4" id="skills">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#512d7c]">
            Available Digital Skills
          </h2>
          <p className="mb-8 text-gray-700">
            Explore our range of in-demand digital skills to choose the course that aligns with your career goals. Each skill is taught by industry experts to prepare you for the digital economy.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Digital Literacy */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">💻</span> Digital Literacy
              </h3>
              <p className="text-gray-600">
                Master essential computer and internet skills, including software navigation, online communication, and digital tools for everyday tasks.
              </p>
            </div>
            {/* UI/UX Design */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">🎨</span> UI/UX Design
              </h3>
              <p className="text-gray-600">
                Learn to create user-friendly interfaces and seamless experiences for websites and apps, focusing on design principles and user research.
              </p>
            </div>
            {/* Data Analytics */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">📊</span> Data Analytics
              </h3>
              <p className="text-gray-600">
                Gain expertise in analyzing data to uncover insights, using tools like Excel, Tableau, and Power BI for data-driven decisions.
              </p>
            </div>
            {/* Cyber Security */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">🛡️</span> Cyber Security
              </h3>
              <p className="text-gray-600">
                Develop skills to protect digital assets, covering threat detection, encryption, and secure system management.
              </p>
            </div>
            {/* Digital Marketing */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">📢</span> Digital Marketing
              </h3>
              <p className="text-gray-600">
                Master strategies for online advertising, SEO, content marketing, and social media to boost brand visibility.
              </p>
            </div>
            {/* Digital Branding */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">🖌️</span> Digital Branding
              </h3>
              <p className="text-gray-600">
                Learn to build and manage a strong online brand identity through logos, visuals, and consistent messaging.
              </p>
            </div>
            {/* Graphics & 3D Design */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">🧊</span> Graphics & 3D Design
              </h3>
              <p className="text-gray-600">
                Create stunning visuals and 3D models for branding, games, and animations using tools like Photoshop, Blender, and Illustrator.
              </p>
            </div>
            {/* Coding */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">💻</span> Coding
              </h3>
              <p className="text-gray-600">
                Acquire programming skills in Python, R, SQL, HTML, CSS, and JavaScript to build software and web applications.
              </p>
            </div>
            {/* Web Design & Development */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">🌐</span> Web Design & Development
              </h3>
              <p className="text-gray-600">
                Design and develop responsive websites using modern tools and frameworks for a professional online presence.
              </p>
            </div>
            {/* Mobile App Development */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">📱</span> Mobile App Development
              </h3>
              <p className="text-gray-600">
                Create functional mobile applications for Android and iOS platforms, focusing on coding and user experience.
              </p>
            </div>
            {/* Social Media Setup & Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">👥</span> Social Media Setup & Management
              </h3>
              <p className="text-gray-600">
                Learn to set up and manage social media accounts, creating engaging content to grow an online audience.
              </p>
            </div>
            {/* AI & CRM */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">🤖</span> AI & CRM
              </h3>
              <p className="text-gray-600">
                Explore artificial intelligence and customer relationship management systems to automate and enhance business processes.
              </p>
            </div>
            {/* Project Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">🗂️</span> Project Management
              </h3>
              <p className="text-gray-600">
                Develop skills to plan, execute, and deliver projects efficiently using tools like Trello, Asana, and Agile methodologies.
              </p>
            </div>
            {/* Digital Monetization */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">💸</span> Digital Monetization
              </h3>
              <p className="text-gray-600">
                Discover strategies to earn income online through freelancing, e-commerce, affiliate marketing, and content creation.
              </p>
            </div>
            {/* Cloud Computing */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow flex flex-col hover:shadow-md">
              <h3 className="text-lg font-semibold text-[#512d7c] mb-2 flex items-center gap-2">
                <span className="text-2xl">☁️</span> Cloud Computing
              </h3>
              <p className="text-gray-600">
                Learn to manage and deploy cloud-based solutions using platforms like AWS, Azure, and Google Cloud for scalability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Tiers - Sample */}
      <section className="bg-white py-16 px-4" id="tiers">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#512d7c]">Our Training Tiers</h2>
          <p className="mb-8 text-gray-700">
            Choose the tier that best fits your goals. All tiers include hybrid delivery, weekly assessments, and a certificate of completion...
          </p>
          <div className={scrollContainerClasses}>
            {trainingTiers.map((tier) => (
              <div
                key={tier.title}
                className="snap-start flex-shrink-0 w-[85%] min-w-[280px] max-w-sm rounded-xl border border-[#512d7c]/20 bg-[#f9f9f9] p-6 shadow md:mx-0 md:w-auto"
              >
                <h3 className="text-lg font-bold mb-3 text-[#512d7c]">{tier.title}</h3>
                <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-700">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Button className="bg-[#f2b42c] text-white mt-auto hover:bg-[#512d7c]">
                  {tier.label}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O'level Program Table */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow px-4 py-8 mt-12">
        <h3 className="text-xl font-bold text-[#512d7c] mb-2">O'level Program (SSS Graduate)</h3>
        <p className="mb-4 text-gray-700">Targeted for secondary school graduates (ages 14-18+), with weekly sessions focused on hands-on projects for higher institutes and digital careers.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-[#512d7c] text-white">
                <th className="p-2 border">Day</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Activity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">Tue,Wed & Fri</td>
                <td className="p-2 border">10 AM - 4 PM</td>
                <td className="p-2 border">Training Session</td>
              </tr>
              <tr>
                <td className="p-2 border">Weekend (Sat)</td>
                <td className="p-2 border">11 AM - 4 PM</td>
                <td className="p-2 border">Skill-Building Sessions (Project)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> <em>Basic tier includes 3 months, Standard 6 months, Advance 1 year with career-focused workshops.</em>
        </p>
      </div>

      {/* Training Strategy (Syllabus) */}
      <section className="bg-[#f9f9f9] py-16 px-4" id="strategy">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#512d7c]">Our Training Strategy</h2>
          <p className="mb-8 text-gray-700">Our tutoring program is structured in 3 stages to ensure progressive learning and practical application:</p>
          <div className={scrollContainerClasses}>
            {trainingStages.map((stage) => (
              <div
                key={stage.name}
                className="snap-start flex-shrink-0 w-[85%] min-w-[280px] max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow md:w-auto"
              >
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-[#512d7c]">
                  <span className="text-2xl">{stage.emoji}</span>
                  {stage.name}
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {stage.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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

          <div className="mt-8 flex flex-col gap-4 rounded-xl bg-white p-4 ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Ready to get started? Create an account and start learning today.
              Enrollment closes <span className="font-bold">Nov 30</span>. Only <span className="text-[#f2b42c] font-bold">15</span> slots left for this batch!
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button className="w-full justify-center bg-[#512d7c] text-white hover:bg-[#3f2361]">
                  Start learning
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full justify-center border-[#512d7c] text-[#512d7c] hover:bg-[#512d7c]/10"
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
            <Image src="./Logoo.jpg" alt="D Global Growthfield logo" width={32} height={32} />
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
            © {new Date().getFullYear()} <a href="https://calexportfolio-self.vercel.app" target= "_blank"> Powered by OLUMIDE</a>
          </p>
        </div>
      </footer>
    </div>
  )
}