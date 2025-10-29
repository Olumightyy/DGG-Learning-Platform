"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface DeleteButtonProps {
  itemId: string
  itemType: "material" | "assignment"
  itemName: string
  redirectTo?: string
}

export function DeleteButton({ itemId, itemType, itemName, redirectTo = "/instructor/dashboard" }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/${itemType === "material" ? "materials" : "assignments"}/${itemId}/delete`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to delete ${itemType}`)
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${itemType}`
      console.error("Delete error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" size="sm">
        {isDeleting ? "Deleting..." : `Delete ${itemType === "material" ? "Material" : "Assignment"}`}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
