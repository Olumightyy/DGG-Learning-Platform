import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { YouTubePlayer } from "@/components/youtube-player"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

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

  const { data: material, error: materialError } = await supabase.from("materials").select("*").eq("id", id).single()

  if (!material || materialError) {
    notFound()
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("material_id", id)
    .single()

  if (!material.is_public && !enrollment) {
    notFound()
  }

  // Fetch videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("material_id", id)
    .order("order_index", { ascending: true })

  return (
    <div className="space-y-8">
      <div>
        <Link href="/student/dashboard">
          <Button variant="outline" className="mb-4 bg-transparent">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{material.title}</h1>
        <p className="text-gray-600 mt-2">{material.description}</p>
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
      {videos && videos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Videos</h2>
          <div className="space-y-4">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle>{video.title}</CardTitle>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <YouTubePlayer url={video.youtube_url} title={video.title} className="w-full h-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
