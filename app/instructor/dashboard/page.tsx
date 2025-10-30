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

  // Fetch instructor's materials
  const { data: materials } = await supabase
    .from("materials")
    .select("id, title, description, is_public, created_at")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch instructor's assignments
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      description,
      due_date,
      material_id,
      materials:material_id (
        title
      )
    `)
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch total enrollments across all materials
  const { data: enrollments, count: totalEnrollments } = await supabase
    .from("enrollments")
    .select("id", { count: "exact" })
    .in("material_id", materials?.map((m) => m.id) || [])

  // Fetch pending submissions
  const { data: submissions, count: pendingCount } = await supabase
    .from("submissions")
    .select("id", { count: "exact" })
    .in("assignment_id", assignments?.map((a) => a.id) || [])
    .is("score", null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your courses, assignments, and students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{materials?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assignments?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEnrollments || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{pendingCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/instructor/materials/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">+ Create New Course</CardTitle>
              <CardDescription>Add learning materials for students</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/instructor/assignments/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">+ Create Assignment</CardTitle>
              <CardDescription>Assign tasks to your students</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/instructor/materials">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-900">View All Courses</CardTitle>
              <CardDescription>Manage existing courses</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Materials */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
          <Link href="/instructor/materials">
            <button className="text-blue-600 hover:underline">View All →</button>
          </Link>
        </div>
        {materials && materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.slice(0, 6).map((material) => (
              <Link key={material.id} href={`/instructor/materials/${material.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                      {material.is_public && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
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
              <p className="text-gray-600 mb-4">You haven't created any courses yet.</p>
              <Link href="/instructor/materials/new">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Your First Course
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Assignments */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Assignments</h2>
        </div>
        {assignments && assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.slice(0, 5).map((assignment: any) => (
              <Link key={assignment.id} href={`/instructor/assignments/${assignment.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.description}</CardDescription>
                        <p className="text-sm text-gray-500 mt-1">
                          Course: {assignment.materials?.title || "Unknown"}
                        </p>
                      </div>
                      {assignment.due_date && (
                        <p className="text-sm text-gray-600">
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