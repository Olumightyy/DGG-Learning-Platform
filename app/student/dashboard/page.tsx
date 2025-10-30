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
  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("material_id, materials(id, title, description)")
    .eq("student_id", user.id)

  console.log("Enrollments:", enrollments)
  console.log("Enroll Error:", enrollError)

  // Get list of enrolled material IDs
  const enrolledMaterialIds = enrollments?.map((e) => e.material_id) || []

  // Fetch assignments for enrolled materials OR public materials
  const { data: assignments, error: assignError } = await supabase
    .from("assignments")
    .select(`
      id, 
      title, 
      description, 
      due_date, 
      material_id,
      materials(id, title, is_public)
    `)
    .order("due_date", { ascending: true })

  console.log("Assignments:", assignments)
  console.log("Assign Error:", assignError)

  // Filter assignments: show only if student is enrolled OR material is public
  const visibleAssignments = assignments?.filter(
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your learning materials and assignments</p>
      </div>

      {/* Enrolled Materials Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Materials</h2>
        {enrollments && enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment) => (
              <Link key={enrollment.material_id} href={`/student/materials/${enrollment.material_id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{enrollment.materials?.title}</CardTitle>
                    <CardDescription>{enrollment.materials?.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                You are not enrolled in any materials yet.{" "}
                <Link href="/student/explore" className="text-blue-600 hover:underline">
                  Explore courses
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignments Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Assignments</h2>
        {visibleAssignments && visibleAssignments.length > 0 ? (
          <div className="space-y-4">
            {visibleAssignments.map((assignment) => {
              const submission = submissionMap.get(assignment.id)
              const isSubmitted = !!submission
              const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
              const isOverdue = dueDate && dueDate < new Date() && !isSubmitted
              const isPublicMaterial = assignment.materials?.is_public === true
              const isEnrolled = enrolledMaterialIds.includes(assignment.material_id)

              return (
                <Link key={assignment.id} href={`/student/assignments/${assignment.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle>{assignment.title}</CardTitle>
                          <CardDescription>{assignment.description}</CardDescription>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {assignment.materials?.title}
                            </span>
                            {isPublicMaterial && !isEnrolled && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                Public Course
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {isSubmitted ? (
                            <div className="text-sm">
                              <p className="text-green-600 font-semibold">Submitted</p>
                              {submission.score !== null && <p className="text-gray-600">Score: {submission.score}</p>}
                            </div>
                          ) : isOverdue ? (
                            <p className="text-red-600 font-semibold text-sm">Overdue</p>
                          ) : (
                            <p className="text-blue-600 font-semibold text-sm">Pending</p>
                          )}
                        </div>
                      </div>
                      {dueDate && (
                        <p className="text-sm text-gray-500 mt-2">
                          Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            <CardContent className="pt-6">
              <p className="text-gray-600">No assignments available yet.</p>
              {enrollments && enrollments.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Enroll in courses to see assignments!
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}