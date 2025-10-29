"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface Material {
  id: string
  title: string
}

export default function NewAssignmentPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxScore, setMaxScore] = useState("100")
  const [materialId, setMaterialId] = useState("")
  const [materials, setMaterials] = useState<Material[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error: fetchError } = await supabase
          .from("materials")
          .select("id, title")
          .eq("instructor_id", user.id)
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Error fetching materials:", fetchError)
          setError("Failed to load your materials")
        } else {
          setMaterials(data || [])
          // Auto-select first material if available
          if (data && data.length > 0) {
            setMaterialId(data[0].id)
          }
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load materials")
      } finally {
        setLoadingMaterials(false)
      }
    }

    fetchMaterials()
  }, [])

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

      console.log("Creating assignment for user:", user.id)
      console.log("Assignment data:", { title, description, dueDate, maxScore, materialId })

      const { data, error: insertError } = await supabase
        .from("assignments")
        .insert([
          {
            instructor_id: user.id,
            material_id: materialId,
            title: title.trim(),
            description: description.trim(),
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            max_score: Number.parseInt(maxScore, 10),
          },
        ])
        .select()

      if (insertError) {
        console.error("Insert error:", insertError)
        throw new Error(`Failed to create assignment: ${insertError.message}`)
      }

      console.log("Assignment created successfully:", data)

      // Redirect to dashboard
      router.push("/instructor/dashboard")
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      console.error("Assignment creation error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingMaterials) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading materials...</p>
      </div>
    )
  }

  if (materials.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>No Materials Found</CardTitle>
            <CardDescription>You need to create a material before creating assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/instructor/materials/new")}>Create Material First</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Assignment</h1>
        <p className="text-gray-600 mt-2">Add a new assignment for your students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Fill in the information about your assignment</CardDescription>
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

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <p className="text-xs text-red-500 mt-1">Check the browser console for more details</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || !title.trim() || !materialId}>
                {isLoading ? "Creating..." : "Create Assignment"}
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
