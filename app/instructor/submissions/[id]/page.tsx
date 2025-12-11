"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function SubmissionPage() {
  const params = useParams()
  const id = params.id as string
  const [submission, setSubmission] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch submission
      const { data: submissionData } = await supabase
        .from("submissions")
        .select("*, assignments(id, title, max_score), profiles(email)")
        .eq("id", id)
        .single()

      if (submissionData) {
        setSubmission(submissionData)
        setAssignment(submissionData.assignments)
        setScore(submissionData.score?.toString() || "")
        setFeedback(submissionData.feedback || "")
      }

      setLoading(false)
    }

    fetchData()
  }, [id, supabase])

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          score: score ? Number.parseInt(score) : null,
          feedback,
          graded_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Refresh submission data
      const { data: updatedSubmission } = await supabase.from("submissions").select("*").eq("id", id).single()

      setSubmission(updatedSubmission)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!submission) {
    return <div className="text-center py-8">Submission not found</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/instructor/assignments/${submission.assignment_id}`}>
          <Button variant="outline" className="mb-4 bg-transparent">
            ← Back to Assignment
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
        <p className="text-gray-600 mt-2">
          Student: {submission.profiles?.email} | Assignment: {assignment?.title}
        </p>
      </div>

      {/* Student Submission */}
      <Card>
        <CardHeader>
          <CardTitle>Student Submission</CardTitle>
          <CardDescription>Submitted: {new Date(submission.submitted_at).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-wrap">{submission.submission_text}</p>
          </div>
        </CardContent>
      </Card>

      {/* Grading Form */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Submission</CardTitle>
          <CardDescription>Max Score: {assignment?.max_score}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrade} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max={assignment?.max_score}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter score"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedback">Feedback</Label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Enter feedback for the student..."
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Grade"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
