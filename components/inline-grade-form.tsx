"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { updateGrade } from "@/app/actions/update-grade"
import { ChevronDown, ChevronUp } from "lucide-react"

interface InlineGradeFormProps {
  submissionId: string
  initialScore: number | null
  initialFeedback: string | null
  maxScore: number
  assignmentId: string
  studentName: string
}

export function InlineGradeForm({
  submissionId,
  initialScore,
  initialFeedback,
  maxScore,
  assignmentId,
  studentName,
}: InlineGradeFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [score, setScore] = useState(initialScore?.toString() || "")
  const [feedback, setFeedback] = useState(initialFeedback || "")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const scoreNum = parseFloat(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
      setError(`Score must be between 0 and ${maxScore}`)
      return
    }

    startTransition(async () => {
      try {
        await updateGrade(submissionId, scoreNum, feedback || null, assignmentId)
        setSuccessMessage(`Grade saved for ${studentName}!`)
        setTimeout(() => {
          setSuccessMessage(null)
          setIsExpanded(false)
        }, 2000)
      } catch (err) {
        console.error("Error saving grade:", err)
        setError(err instanceof Error ? err.message : "Failed to save grade")
      }
    })
  }

  return (
    <div className="mt-3">
      {!isExpanded ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsExpanded(true)}
        >
          {initialScore !== null ? "Edit Grade" : "Grade Submission"}
        </Button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-gray-900">Grade & Feedback</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false)
                setError(null)
                setSuccessMessage(null)
              }}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
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
                disabled={isPending}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder={`Enter score (0-${maxScore})`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                disabled={isPending}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="Provide feedback to the student..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-xs text-red-600">❌ {error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-green-600">✅ {successMessage}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? "Saving..." : initialScore !== null ? "Update Grade" : "Save Grade"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsExpanded(false)
                  setScore(initialScore?.toString() || "")
                  setFeedback(initialFeedback || "")
                  setError(null)
                  setSuccessMessage(null)
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
