import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function MaterialsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all materials for this instructor
  const { data: materials } = await supabase
    .from("materials")
    .select("*")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  // Get counts for each material
  const materialsWithCounts = await Promise.all(
    (materials || []).map(async (material) => {
      const { count: videoCount } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("material_id", material.id)

      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("material_id", material.id)

      return {
        ...material,
        videoCount: videoCount || 0,
        enrollmentCount: enrollmentCount || 0,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/instructor/dashboard">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">All Materials</h1>
          <p className="text-gray-600 mt-2">Manage your course materials and content</p>
        </div>
        <Link href="/instructor/materials/new">
          <Button>+ Create New Material</Button>
        </Link>
      </div>

      {materialsWithCounts && materialsWithCounts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materialsWithCounts.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{material.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {material.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-gray-600 mb-4">
                  <span>📹 {material.videoCount} videos</span>
                  <span>👥 {material.enrollmentCount} students</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <Link href={`/instructor/materials/${material.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/instructor/materials/${material.id}/edit`}>
                    <Button variant="outline" size="icon">
                      ✏️
                    </Button>
                  </Link>
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    material.is_public 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {material.is_public ? '✓ Public' : '○ Draft'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No materials yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first course material.</p>
            <Link href="/instructor/materials/new">
              <Button>Create Your First Material</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
