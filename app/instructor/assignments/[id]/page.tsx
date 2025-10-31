import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function InstructorAssignmentPage({
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

  // Fetch assignment with material info
  const { data: assignment } = await supabase
    .from("assignments")
    .select(`
      *,
      materials (
        id,
        title,
        instructor_id
      )
    `)
    .eq("id", id)
    .single()

  if (!assignment || assignment.materials?.instructor_id !== user.id) {
    notFound()
  }

  // Fetch all submissions for this assignment
  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      *,
      profiles:student_id (
        email,
        full_name
      )
    `)
    .eq("assignment_id", id)
    .order("submitted_at", { ascending: false })

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
  const submissionCount = submissions?.length || 0

  return (
    <div className="space-y-8">
      <div>
        <Link href="/instructor/dashboard">
          <Button variant="outline" className="mb-4 bg-transparent">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
        <p className="text-gray-600 mt-2">{assignment.description}</p>
      </div>

      {/* Assignment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{submissionCount}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Max Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assignment.max_score || "N/A"}</p>
          </CardContent>
        </Card>

        {dueDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dueDate.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submissions List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Submissions</h2>
        
        {submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {submission.profiles?.full_name || submission.profiles?.email || "Unknown Student"}
                      </CardTitle>
                      <CardDescription>
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.score !== null ? (
                        <span className="text-lg font-bold text-green-600">
                          {submission.score}/{assignment.max_score}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                          Not Graded
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Submission Text Preview */}
                    {submission.submission_text && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Submission:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {submission.submission_text}
                        </p>
                      </div>
                    )}

                    {/* File Link */}
                    {submission.file_url && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Attached File:</p>
                        <a
                          href={submission.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          📎 Download file
                        </a>
                      </div>
                    )}

                    {/* Feedback Preview */}
                    {submission.feedback && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Feedback:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {submission.feedback}
                        </p>
                      </div>
                    )}

                    {/* View/Grade Button */}
                    <Link href={`/instructor/submissions/${submission.id}`}>
                      <Button variant="outline" className="w-full mt-2">
                        {submission.score !== null ? "View & Edit Grade" : "Grade Submission"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600">Students haven't submitted their work for this assignment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}