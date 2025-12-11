import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DeleteButton } from "@/components/delete-button"

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch assignment
  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .eq("instructor_id", user.id)
    .single()

  if (!assignment) {
    notFound()
  }

  // Fetch submissions
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, student_id, submission_text, score, submitted_at, profiles(email)")
    .eq("assignment_id", id)
    .order("submitted_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/instructor/dashboard">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="text-gray-600 mt-2">{assignment.description}</p>
        </div>
        <DeleteButton itemId={id} itemType="assignment" itemName={assignment.title} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Max Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{assignment.max_score}</p>
          </CardContent>
        </Card>
        {assignment.due_date && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{new Date(assignment.due_date).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{submissions?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Submissions</h2>
        {submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Link key={submission.id} href={`/instructor/submissions/${submission.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{submission.profiles?.email}</CardTitle>
                        <CardDescription>
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {submission.score !== null ? (
                          <p className="text-2xl font-bold text-green-600">{submission.score}</p>
                        ) : (
                          <p className="text-sm text-blue-600 font-semibold">Pending Review</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">No submissions yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
