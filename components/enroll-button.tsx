"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

interface EnrollButtonProps {
  materialId: string
  isEnrolled: boolean
}

export function EnrollButton({ materialId, isEnrolled }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [enrolled, setEnrolled] = useState(isEnrolled)
  const router = useRouter()

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/enrollments/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ materialId }),
      })

      if (response.ok) {
        setEnrolled(true)
        router.refresh()
      }
    } catch (error) {
      console.error("Enrollment error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (enrolled) {
    return (
      <Button variant="outline" disabled className="w-full bg-transparent">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Enrolled
      </Button>
    )
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} className="w-full">
      {loading ? "Enrolling..." : "Enroll Now"}
    </Button>
  )
}
