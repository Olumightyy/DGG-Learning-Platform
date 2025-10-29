"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function AssignmentPage() {
  const params = useParams()
  const id = params.id as string
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submissionText, setSubmissionText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch assignment
      const { data: assignmentData } = await supabase.from("assignments").select("*").eq("id", id).single()

      setAssignment(assignmentData)

      // Fetch submission
      const { data: submissionData } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", id)
        .eq("student_id", user.id)
        .single()

      if (submissionData) {
        setSubmission(submissionData)
        setSubmissionText(submissionData.submission_text || "")
        setFileUrl(submissionData.file_url || "")
      }

      setLoading(false)
    }

    fetchData()
  }, [id, supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      let finalFileUrl = fileUrl

      // Upload file if provided
      if (uploadedFile) {
        setUploadProgress(50)

        // Create or get submission first to use its ID
        let submissionId = submission?.id

        if (!submissionId) {
          const { data: newSubmission, error: createError } = await supabase
            .from("submissions")
            .insert({
              assignment_id: id,
              student_id: user.id,
              submission_text: submissionText,
              submitted_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (createError) throw createError
          submissionId = newSubmission.id
        }

        // Upload file
        const formData = new FormData()
        formData.append("file", uploadedFile)
        formData.append("submissionId", submissionId)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("File upload failed")
        }

        const uploadData = await uploadResponse.json()
        finalFileUrl = uploadData.url

        setUploadProgress(100)
      }

      if (submission) {
        // Update existing submission
        const { error } = await supabase
          .from("submissions")
          .update({
            submission_text: submissionText,
            file_url: finalFileUrl,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", submission.id)

        if (error) throw error
      } else {
        // Create new submission
        const { error } = await supabase.from("submissions").insert({
          assignment_id: id,
          student_id: user.id,
          submission_text: submissionText,
          file_url: finalFileUrl,
          submitted_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      // Refresh submission data
      const { data: updatedSubmission } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", id)
        .eq("student_id", user.id)
        .single()

      setSubmission(updatedSubmission)
      setFileUrl(updatedSubmission.file_url || "")
      setUploadedFile(null)
      setUploadProgress(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setUploadProgress(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!assignment) {
    return <div className="text-center py-8">Assignment not found</div>
  }

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
  const isOverdue = dueDate && dueDate < new Date() && !submission

  return (
    <div className="space-y-8">
      <div>
        <Link href="/student/dashboard">
          <Button variant="outline" className="mb-4 bg-transparent">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
        <p className="text-gray-600 mt-2">{assignment.description}</p>
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
        {dueDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${isOverdue ? "text-red-600" : ""}`}>{dueDate.toLocaleDateString()}</p>
            </CardContent>
          </Card>
        )}
        {submission && submission.score !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{submission.score}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {submission && submission.feedback && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{submission.feedback}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Submission</CardTitle>
          <CardDescription>{submission ? "Update your submission" : "Submit your work"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Submission Text</label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Enter your submission here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (Optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploadedFile && <p className="text-sm text-gray-600 mt-2">Selected: {uploadedFile.name}</p>}
            </div>

            {fileUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Current file:</p>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                  Download submission file
                </a>
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : submission ? "Update Submission" : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
