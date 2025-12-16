import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"
import JoinLiveButton from '@/components/join-live-button'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // 1. Fetch enrolled materials first
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      material_id,
      materials:material_id (
        id,
        title,
        description
      )
    `)
    .eq("student_id", user.id)

  // Normalize enrollments
  const normalizedEnrollments = (enrollments || []).map((e: any) => ({
    ...e,
    material: Array.isArray(e.materials) ? e.materials[0] : e.materials,
  }))

  // Get list of enrolled IDs
  const enrolledMaterialIds = normalizedEnrollments.map((e: any) => e.material_id) || []

  // 2. Fetch Assignments (STRICT FILTER)
  // Only fetch assignments if the user is actually enrolled in something
  let visibleAssignments: any[] = []

  if (enrolledMaterialIds.length > 0) {
    const { data: assignments } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        description,
        due_date,
        material_id,
        materials:material_id (
          id,
          title
        )
      `)
      .in("material_id", enrolledMaterialIds) // <--- CRITICAL FIX: Only fetch for enrolled courses
      .order("created_at", { ascending: false })

    // Normalize the assignments
    visibleAssignments = (assignments || []).map((a: any) => ({
      ...a,
      material: Array.isArray(a.materials) ? a.materials[0] : a.materials,
    }))
  }

  // Fetch submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select("assignment_id, score, submitted_at")
    .eq("student_id", user.id)

  const submissionMap = new Map(submissions?.map((s) => [s.assignment_id, s]) || [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-gray-600 mt-2">Manage your learning materials and assignments</p>
      </div>

      {/* Join Live Class */}
      <div className="mt-4">
        <JoinLiveButton />
      </div>

      {/* Enrolled Materials */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Materials</h2>
          <Link href="/student/explore">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Explore Courses
            </button>
          </Link>
        </div>
        
        {normalizedEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalizedEnrollments.map((enrollment: any) => (
              <Link key={enrollment.material_id} href={`/student/materials/${enrollment.material_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.material?.title || "Untitled"}</CardTitle>
                    <CardDescription>{enrollment.material?.description || "No description"}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
              <Link href="/student/explore">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Browse Courses
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignments */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Assignments</h2>
        {visibleAssignments.length > 0 ? (
          <div className="space-y-4">
            {visibleAssignments.map((assignment: any) => {
              const submission = submissionMap.get(assignment.id)
              const isSubmitted = !!submission
              const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
              const isOverdue = dueDate && dueDate < new Date() && !isSubmitted

              return (
                <Link key={assignment.id} href={`/student/assignments/${assignment.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle>{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {assignment.material?.title || "Unknown Course"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {isSubmitted ? (
                            <div className="text-sm">
                              <p className="text-green-600 font-semibold">✓ Submitted</p>
                              {submission.score !== null && (
                                <p className="text-gray-600">Score: {submission.score}</p>
                              )}
                            </div>
                          ) : isOverdue ? (
                            <p className="text-red-600 font-semibold text-sm">⚠ Overdue</p>
                          ) : (
                            <p className="text-blue-600 font-semibold text-sm">Pending</p>
                          )}
                        </div>
                      </div>
                      {dueDate && (
                        <p className="text-sm text-gray-500 mt-2">
                          Due: {dueDate.toLocaleDateString()}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600">No active assignments for your courses.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}