"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface GradeSubmissionFormProps {
  submissionId: string
  currentScore: number | null
  currentFeedback: string | null
  maxScore: number
  assignmentId: string
}

export function GradeSubmissionForm({
  submissionId,
  currentScore,
  currentFeedback,
  maxScore,
  assignmentId,
}: GradeSubmissionFormProps) {
  const [score, setScore] = useState(currentScore?.toString() || "")
  const [feedback, setFeedback] = useState(currentFeedback || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const scoreNum = parseFloat(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
      setError(`Score must be between 0 and ${maxScore}`)
      setIsSubmitting(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from("submissions")
        .update({
          score: scoreNum,
          feedback: feedback || null,
          graded_at: new Date().toISOString(),
        })
        .eq("id", submissionId)

      if (updateError) throw updateError

      alert("Grade saved successfully!")
      router.push(`/instructor/assignments/${assignmentId}`)
      router.refresh()
    } catch (err) {
      console.error("Error saving grade:", err)
      setError(err instanceof Error ? err.message : "Failed to save grade")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Score (out of {maxScore}) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          min="0"
          max={maxScore}
          step="0.5"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Enter score (0-${maxScore})`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Feedback (Optional)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Provide feedback to the student..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-600">❌ {error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : currentScore !== null ? "Update Grade" : "Save Grade"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/instructor/assignments/${assignmentId}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}