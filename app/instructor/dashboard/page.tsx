import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function InstructorDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch instructor's materials
  try {
    const { data: materials, error: materialsError } = await supabase
      .from("materials")
      .select("id, title, description, created_at")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false })

    if (materialsError) {
      console.error("Error fetching materials:", materialsError)
    }

    // Fetch instructor's assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("id, title, due_date, instructor_id")
      .eq("instructor_id", user.id)
      .order("due_date", { ascending: true })

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError)
    }

    // Count submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("id, assignment_id, score")
      .in("assignment_id", assignments?.map((a) => a.id) || [])

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError)
    }

    const submissionsByAssignment = new Map<string, { total: number; graded: number }>()
    assignments?.forEach((a) => {
      submissionsByAssignment.set(a.id, { total: 0, graded: 0 })
    })

    submissions?.forEach((s) => {
      const current = submissionsByAssignment.get(s.assignment_id) || { total: 0, graded: 0 }
      current.total++
      if (s.score !== null) current.graded++
      submissionsByAssignment.set(s.assignment_id, current)
    })

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your materials and assignments</p>
          </div>
          <Link href="/instructor/materials/new">
            <Button>Create Material</Button>
          </Link>
        </div>

        {/* Materials Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Materials</h2>
            <Link href="/instructor/materials/new">
              <Button variant="outline" size="sm">
                + New Material
              </Button>
            </Link>
          </div>
          {materials && materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((material) => (
                <Link key={material.id} href={`/instructor/materials/${material.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                      <CardDescription>{material.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(material.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">You haven&apos;t created any materials yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Assignments Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Assignments</h2>
            <Link href="/instructor/assignments/new">
              <Button variant="outline" size="sm">
                + New Assignment
              </Button>
            </Link>
          </div>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const stats = submissionsByAssignment.get(assignment.id) || { total: 0, graded: 0 }
                const dueDate = assignment.due_date ? new Date(assignment.due_date) : null

                return (
                  <Link key={assignment.id} href={`/instructor/assignments/${assignment.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{assignment.title}</CardTitle>
                            {dueDate && (
                              <p className="text-sm text-gray-500 mt-1">Due: {dueDate.toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {stats.graded}/{stats.total} graded
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">You haven&apos;t created any assignments yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("An error occurred:", error)
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your materials and assignments</p>
          </div>
          <Link href="/instructor/materials/new">
            <Button>Create Material</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">An error occurred while fetching data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
