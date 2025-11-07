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

  const { data: material, error: materialError } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single()

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

  // Fetch resources
  const { data: resources } = await supabase
    .from("course_resources")
    .select("*")
    .eq("material_id", id)
    .order("order_index", { ascending: true })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
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
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{material.content}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Videos Section */}
      {videos && videos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🎥</span>
            <h2 className="text-2xl font-bold text-gray-900">Video Lessons</h2>
            <span className="text-sm text-gray-500">({videos.length})</span>
          </div>
          <div className="space-y-6">
            {videos.map((video, index) => (
              <Card key={video.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <CardTitle className="text-xl">{video.title}</CardTitle>
                      {video.description && (
                        <CardDescription className="mt-1">{video.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <YouTubePlayer 
                      url={video.youtube_url} 
                      title={video.title} 
                      className="w-full h-full" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resources Section - NEW! */}
      {resources && resources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">📚</span>
            <h2 className="text-2xl font-bold text-gray-900">Course Resources</h2>
            <span className="text-sm text-gray-500">({resources.length})</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => {
              const getIcon = (type: string) => {
                const icons: Record<string, string> = {
                  pdf: '📄',
                  document: '📝',
                  video: '🎬',
                  image: '🖼️',
                  link: '🔗',
                  other: '📦'
                }
                return icons[type] || '📄'
              }

              const getTypeLabel = (type: string) => {
                const labels: Record<string, string> = {
                  pdf: 'PDF Document',
                  document: 'Document',
                  video: 'Video File',
                  image: 'Image',
                  link: 'External Link',
                  other: 'File'
                }
                return labels[type] || 'Resource'
              }

              return (
                <Card key={resource.id} className="hover:shadow-lg transition-all hover:border-blue-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-3xl">
                          {getIcon(resource.resource_type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                          {resource.title}
                        </h3>
                        
                        <span className="inline-block text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded mb-2">
                          {getTypeLabel(resource.resource_type)}
                        </span>

                        {resource.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                        )}

                        {/* File Info */}
                        <div className="flex items-center gap-3 mb-3">
                          {resource.file_size && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              💾 {(resource.file_size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                          {resource.file_name && (
                            <span className="text-xs text-gray-500 truncate max-w-[200px]" title={resource.file_name}>
                              📎 {resource.file_name}
                            </span>
                          )}
                        </div>

                        {/* Download/View Button */}
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                        >
                          {resource.resource_type === 'link' ? (
                            <>
                              <span>🔗</span>
                              <span>Open Link</span>
                            </>
                          ) : (
                            <>
                              <span>⬇️</span>
                              <span>Download</span>
                            </>
                          )}
                          <span>→</span>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* No Content Message */}
      {(!videos || videos.length === 0) && (!resources || resources.length === 0) && !material.content && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-600">
              Your instructor hasn't added any videos or resources to this course yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}