import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function StudentDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch enrolled materials
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

  // Get enrolled material IDs
  const enrolledMaterialIds = enrollments?.map((e) => e.material_id) || []

  // Fetch ALL assignments with material info
  const { data: allAssignments } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      description,
      due_date,
      material_id,
      materials:material_id (
        id,
        title,
        is_public
      )
    `)
    .order("created_at", { ascending: false })

  // Filter visible assignments
  const visibleAssignments = allAssignments?.filter(
    (assignment) =>
      enrolledMaterialIds.includes(assignment.material_id) ||
      assignment.materials?.is_public === true
  ) || []

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
        
        {enrollments && enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment: any) => (
              <Link key={enrollment.material_id} href={`/student/materials/${enrollment.material_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.materials?.title || "Untitled"}</CardTitle>
                    <CardDescription>{enrollment.materials?.description || "No description"}</CardDescription>
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
        {visibleAssignments && visibleAssignments.length > 0 ? (
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
                              {assignment.materials?.title || "Unknown Course"}
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
              <p className="text-gray-600">No assignments available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}