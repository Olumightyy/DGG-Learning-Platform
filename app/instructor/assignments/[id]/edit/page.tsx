"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useParams } from "next/navigation"
import { AssignmentResourceUpload } from "@/components/assignment-resource-upload"

interface Material {
  id: string
  title: string
}

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string | null
  max_score: number
  material_id: string
  resource_url: string | null
  resource_name: string | null
}

export default function EditAssignmentPage() {
  const params = useParams()
  const assignmentId = params.id as string
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxScore, setMaxScore] = useState("100")
  const [materialId, setMaterialId] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [resourceUrl, setResourceUrl] = useState<string | null>(null)
  const [resourceName, setResourceName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setUserId(user.id)

        // Fetch assignment
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("assignments")
          .select("*")
          .eq("id", assignmentId)
          .eq("instructor_id", user.id)
          .single()

        if (assignmentError || !assignmentData) {
          setError("Assignment not found or you don't have permission to edit it")
          setLoadingData(false)
          return
        }

        // Populate form with existing data
        setTitle(assignmentData.title)
        setDescription(assignmentData.description || "")
        setMaterialId(assignmentData.material_id)
        setMaxScore(assignmentData.max_score.toString())
        setResourceUrl(assignmentData.resource_url)
        setResourceName(assignmentData.resource_name)

        // Format due date for datetime-local input
        if (assignmentData.due_date) {
          const date = new Date(assignmentData.due_date)
          const formatted = date.toISOString().slice(0, 16)
          setDueDate(formatted)
        }

        // Fetch materials
        const { data: materialsData, error: materialsError } = await supabase
          .from("materials")
          .select("id, title")
          .eq("instructor_id", user.id)
          .order("created_at", { ascending: false })

        if (materialsError) {
          console.error("Error fetching materials:", materialsError)
        } else {
          setMaterials(materialsData || [])
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load assignment data")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [assignmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      if (!materialId) {
        throw new Error("Please select a material for this assignment")
      }

      const { error: updateError } = await supabase
        .from("assignments")
        .update({
          material_id: materialId,
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          max_score: Number.parseInt(maxScore, 10),
          resource_url: resourceUrl,
          resource_name: resourceName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .eq("instructor_id", user.id)

      if (updateError) {
        console.error("Update error:", updateError)
        throw new Error(`Failed to update assignment: ${updateError.message}`)
      }

      // Redirect to assignment details
      router.push(`/instructor/assignments/${assignmentId}`)
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      console.error("Assignment update error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading assignment...</p>
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Assignment</h1>
        <p className="text-gray-600 mt-2">Update your assignment details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Modify the information about your assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="material">Course/Material *</Label>
              <select
                id="material"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a course/material</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">This assignment will be linked to the selected course/material</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Assignment description and instructions"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxScore">Max Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Assignment Resource Upload */}
            {userId && (
              <AssignmentResourceUpload
                assignmentId={assignmentId}
                instructorId={userId}
                currentResourceUrl={resourceUrl}
                currentResourceName={resourceName}
                onResourceChange={(url, name) => {
                  setResourceUrl(url)
                  setResourceName(name)
                }}
              />
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || !title.trim() || !materialId}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
