"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface Material {
  id: string
  title: string
  description: string
  instructor_id: string
  instructor?: {
    email: string
    full_name: string | null
  }
}

export default function ExplorePage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [enrolledMaterials, setEnrolledMaterials] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("Please log in to view materials")
          setLoading(false)
          return
        }

        console.log("Fetching public materials for user:", user.id)

        // Fetch public materials with instructor info
        const { data: publicMaterials, error: materialsError } = await supabase
          .from("materials")
          .select(`
            id,
            title,
            description,
            instructor_id,
            instructor:profiles!materials_instructor_id_fkey(email, full_name)
          `)
          .eq("is_public", true)
          .order("created_at", { ascending: false })

        if (materialsError) {
          console.error("Materials fetch error:", materialsError)
          // Fallback: Try fetching without instructor info
          const { data: fallbackMaterials, error: fallbackError } = await supabase
            .from("materials")
            .select("id, title, description, instructor_id")
            .eq("is_public", true)
            .order("created_at", { ascending: false })

          if (fallbackError) {
            throw fallbackError
          }

          console.log("Using fallback query - materials:", fallbackMaterials)
          setMaterials(fallbackMaterials || [])
        } else {
          console.log("Public materials found:", publicMaterials?.length || 0)
          setMaterials(publicMaterials || [])
        }

        // Fetch user's enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("material_id")
          .eq("student_id", user.id)

        if (enrollmentsError) {
          console.error("Enrollments fetch error:", enrollmentsError)
        } else {
          setEnrolledMaterials(new Set(enrollments?.map((e) => e.material_id) || []))
        }
      } catch (err) {
        console.error("Fatal fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load materials")
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [])

  const handleEnroll = async (materialId: string) => {
    try {
      setEnrollingId(materialId)
      setError(null)

      const response = await fetch("/api/enrollments/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: materialId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll")
      }

      setEnrolledMaterials((prev) => new Set([...prev, materialId]))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll")
    } finally {
      setEnrollingId(null)
    }
  }

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Explore Learning Materials</h1>
        <p className="text-gray-600 mt-2">Discover and enroll in courses from our instructors</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <Input
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Link href="/student/dashboard">
          <Button variant="outline">My Materials</Button>
        </Link>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-red-500 mt-2">Check the browser console for more details</p>
          </CardContent>
        </Card>
      )}

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const isEnrolled = enrolledMaterials.has(material.id)
            const isEnrolling = enrollingId === material.id

            return (
              <Card key={material.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <CardDescription>{material.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {material.instructor && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">
                        Instructor: {material.instructor.full_name || material.instructor.email}
                      </p>
                    </div>
                  )}
                  {isEnrolled ? (
                    <Link href={`/student/materials/${material.id}`} className="block">
                      <Button className="w-full bg-transparent" variant="outline">
                        View Material
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={() => handleEnroll(material.id)} disabled={isEnrolling} className="w-full">
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center">
              {searchQuery ? "No materials found matching your search." : "No public materials available yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
