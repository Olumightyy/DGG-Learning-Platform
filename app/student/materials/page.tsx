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
    .select(`
      *,
      videos:videos(count),
      enrollments:enrollments(count)
    `)
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Materials</h1>
          <p className="text-gray-600 mt-2">Manage your course materials and content</p>
        </div>
        <Link href="/instructor/materials/new">
          <Button>+ Create New Material</Button>
        </Link>
      </div>

      {materials && materials.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{material.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {material.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-gray-600 mb-4">
                  <span>📹 {material.videos?.[0]?.count || 0} videos</span>
                  <span>👥 {material.enrollments?.[0]?.count || 0} students</span>
                </div>
                <div className="flex gap-2">
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
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    material.is_public 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {material.is_public ? 'Public' : 'Draft'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">No materials created yet.</p>
            <Link href="/instructor/materials/new">
              <Button>Create Your First Material</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
