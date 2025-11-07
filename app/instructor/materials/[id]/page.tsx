import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DeleteButton } from "@/components/delete-button"
import { ResourceUpload } from "@/components/resource-upload"
import { ResourceItem } from "@/components/resource-item"

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch material
  const { data: material } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .eq("instructor_id", user.id)
    .single()

  if (!material) {
    notFound()
  }

  // Fetch videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("material_id", id)
    .order("order_index", { ascending: true })

  // Fetch resources
  const { data: resources } = await supabase
    .from("course_resources")
    .select("*")
    .eq("material_id", id)
    .order("created_at", { ascending: false })

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, profiles(email)")
    .eq("material_id", id)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/instructor/dashboard">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{material.title}</h1>
          <p className="text-gray-600 mt-2">{material.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/instructor/materials/${id}/edit`}>
            <Button>Edit Material</Button>
          </Link>
          <DeleteButton itemId={id} itemType="material" itemName={material.title} />
        </div>
      </div>

      {/* Material Content */}
      {material.content && (
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>{material.content}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Videos Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Videos</h2>
          <Link href={`/instructor/materials/${id}/videos/new`}>
            <Button variant="outline" size="sm">
              + Add Video
            </Button>
          </Link>
        </div>
        {videos && videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{video.title}</CardTitle>
                      <CardDescription>{video.description}</CardDescription>
                    </div>
                    <Link href={`/instructor/videos/${video.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">No videos added yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Course Resources Section - IMPROVED! */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Course Resources</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {resources?.length || 0} uploaded
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div>
            <ResourceUpload materialId={id} />
          </div>

          {/* Resources List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>Uploaded Resources</span>
            </h3>
            
            {resources && resources.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {resources.map((resource) => (
                  <ResourceItem key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📂</div>
                  <p className="text-sm text-gray-600 mb-2">No resources uploaded yet</p>
                  <p className="text-xs text-gray-500">Use the form on the left to add your first resource</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Students */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Enrolled Students ({enrollments?.length || 0})
        </h2>
        {enrollments && enrollments.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.student_id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <span className="text-gray-700 font-medium">{enrollment.profiles?.email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">No students enrolled yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}