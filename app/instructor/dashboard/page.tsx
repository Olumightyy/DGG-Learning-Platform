import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function InstructorDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, description, is_public, created_at")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      description,
      due_date,
      material_id,
      materials:material_id ( title )
    `)
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  const { count: totalEnrollments } = await supabase
    .from("enrollments")
    .select("id", { count: "exact" })
    .in("material_id", materials?.map((m) => m.id) || [])

  const { count: pendingCount } = await supabase
    .from("submissions")
    .select("id", { count: "exact" })
    .in("assignment_id", assignments?.map((a) => a.id) || [])
    .is("score", null)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#512d7c]">Instructor Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage your courses, assignments, and students</p>
        </div>
        <div className="flex gap-2">
          <Link href="/instructor/materials/new" className="rounded-md bg-[#512d7c] px-3 py-2 text-sm font-medium text-white hover:bg-[#3f2361]">
            + New Course
          </Link>
          <Link href="/instructor/assignments/new" className="rounded-md border border-[#512d7c] px-3 py-2 text-sm font-medium text-[#512d7c] hover:bg-[#512d7c]/10">
            + New Assignment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#512d7c]/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#512d7c]">{materials?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-[#512d7c]/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#512d7c]">{assignments?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-[#512d7c]/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#512d7c]">{totalEnrollments || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-[#f2b42c]/30 bg-[#f2b42c]/10">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#a16f00]">{pendingCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/instructor/materials/new">
          <Card className="cursor-pointer border-[#512d7c]/20 bg-[#512d7c]/5 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#512d7c]">+ Create New Course</CardTitle>
              <CardDescription className="text-gray-700">
                Add learning materials for students
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/instructor/assignments/new">
          <Card className="cursor-pointer border-[#f2b42c]/30 bg-[#f2b42c]/10 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#7a5a0d]">+ Create Assignment</CardTitle>
              <CardDescription className="text-gray-700">
                Assign tasks to your students
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/instructor/materials">
          <Card className="cursor-pointer border-[#512d7c]/20 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#512d7c]">View All Courses</CardTitle>
              <CardDescription className="text-gray-700">
                Manage existing courses
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Courses */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#512d7c]">Your Courses</h2>
          <Link href="/instructor/materials" className="text-[#512d7c] hover:underline">
            View All →
          </Link>
        </div>
        {materials && materials.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.slice(0, 6).map((material) => (
              <Link key={material.id} href={`/instructor/materials/${material.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                      {material.is_public && (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                          Public
                        </span>
                      )}
                    </div>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="mb-4 text-gray-600">You haven't created any courses yet.</p>
              <Link
                href="/instructor/materials/new"
                className="inline-block rounded-md bg-[#512d7c] px-4 py-2 text-white hover:bg-[#3f2361]"
              >
                Create Your First Course
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Assignments */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#512d7c]">Recent Assignments</h2>
        </div>
        {assignments && assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.slice(0, 5).map((assignment: any) => (
              <Link key={assignment.id} href={`/instructor/assignments/${assignment.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-[#512d7c]">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                        <p className="mt-1 text-sm text-gray-500">
                          Course: {assignment.materials?.title || "Unknown"}
                        </p>
                      </div>
                      {assignment.due_date && (
                        <p className="text-sm font-medium text-[#a16f00]">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">No assignments created yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}