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
      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", id)
        .single()

      setAssignment(assignmentData)

      // Fetch submission - use maybeSingle() instead of single()
      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select("*")
        .eq("assignment_id", id)
        .eq("student_id", user.id)
        .maybeSingle() // Changed from .single()

      if (submissionData && !submissionError) {
        setSubmission(submissionData)
        setSubmissionText(submissionData.submission_text || "")
        setFileUrl(submissionData.file_url || "")
      }

      setLoading(false)
    }

    fetchData()
  }, [id])

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
        setUploadProgress(30)

        const formData = new FormData()
        formData.append("file", uploadedFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "File upload failed")
        }

        const uploadData = await uploadResponse.json()
        finalFileUrl = uploadData.url
        setUploadProgress(70)
      }

      // Upsert submission (insert or update)
      const submissionData = {
        assignment_id: id,
        student_id: user.id,
        submission_text: submissionText,
        file_url: finalFileUrl || null,
        submitted_at: new Date().toISOString(),
      }

      const { data: upsertedSubmission, error: upsertError } = await supabase
        .from("submissions")
        .upsert(submissionData, {
          onConflict: "assignment_id,student_id",
        })
        .select()
        .single()

      if (upsertError) throw upsertError

      setUploadProgress(100)
      setSubmission(upsertedSubmission)
      setFileUrl(upsertedSubmission.file_url || "")
      setUploadedFile(null)

      // Success message
      alert("Submission successful!")
    } catch (err) {
      console.error("Submission error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment not found</h2>
        <Link href="/student/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
  const isOverdue = dueDate && dueDate < new Date() && !submission

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
            <p className="text-2xl font-bold">{assignment.max_score || "N/A"}</p>
          </CardContent>
        </Card>
        {dueDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                {dueDate.toLocaleDateString()}
              </p>
              {isOverdue && <p className="text-xs text-red-600 mt-1">Overdue</p>}
            </CardContent>
          </Card>
        )}
        {submission && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {submission.score !== null ? `${submission.score}/${assignment.max_score}` : "Submitted"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {submission && submission.feedback && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Instructor Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{submission.feedback}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Submission</CardTitle>
          <CardDescription>
            {submission ? "You can update your submission below" : "Submit your work for this assignment"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Text {!uploadedFile && !fileUrl && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Enter your submission here..."
                required={!uploadedFile && !fileUrl}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (Optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none 
