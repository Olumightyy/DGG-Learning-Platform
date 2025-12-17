import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { updateGradeFromForm } from "@/app/actions/update-grade"

export default async function SubmissionGradePage({
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

  // Fetch submission with student and assignment info
  const { data: submission } = await supabase
    .from("submissions")
    .select(`
      *,
      assignments (
        id,
        title,
        description,
        max_score,
        material_id,
        materials (
          instructor_id,
          title
        )
      ),
      profiles:student_id (
        email,
        full_name
      )
    `)
    .eq("id", id)
    .single()

  // Normalize nested shapes for materials and determine instructor ownership
  const assignment = submission?.assignments
  const materialsRaw = assignment?.materials
  const materialsArray = Array.isArray(materialsRaw) ? materialsRaw : materialsRaw ? [materialsRaw] : []

  const computedInstructorId =
    assignment?.instructor_id ?? materialsArray[0]?.instructor_id ?? materialsRaw?.instructor_id ?? null

  if (!submission || computedInstructorId !== user.id) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href={`/instructor/assignments/${submission.assignment_id}`}>
          <Button variant="outline" className="mb-4 bg-transparent">
            ← Back to Assignment
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
        <p className="text-gray-600 mt-2">
          {submission.profiles?.full_name || submission.profiles?.email} - {submission.assignments.title}
        </p>
      </div>

      {/* Student Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Student Submission</CardTitle>
          <CardDescription>
            Submitted on {new Date(submission.submitted_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Submission Text */}
          {submission.submission_text && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Submission Text:</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap">
                {submission.submission_text}
              </div>
            </div>
          )}

          {/* Submitted File */}
          {submission.file_url && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Attached File:</h3>
              <a
                href={submission.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline bg-blue-50 px-4 py-2 rounded border border-blue-200"
              >
                📎 Download Submission File
              </a>
            </div>
          )}

          {!submission.submission_text && !submission.file_url && (
            <p className="text-gray-500 italic">No content submitted</p>
          )}
        </CardContent>
      </Card>

      {/* Grading Form */}
      <Card>
        <CardHeader>
          <CardTitle>Grade & Feedback</CardTitle>
          <CardDescription>
            Max Score: {submission.assignments.max_score}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateGradeFromForm} className="space-y-4">
            <input type="hidden" name="submission_id" value={submission.id} />
            <input type="hidden" name="assignment_id" value={submission.assignment_id} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (out of {submission.assignments.max_score}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="score"
                defaultValue={submission.score ?? ""}
                min={0}
                max={submission.assignments.max_score}
                step="0.5"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter score (0-${submission.assignments.max_score})`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (Optional)</label>
              <textarea
                name="feedback"
                defaultValue={submission.feedback ?? ""}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide feedback to the student..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Grade</Button>
              <Link href={`/instructor/assignments/${submission.assignment_id}`}>
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}