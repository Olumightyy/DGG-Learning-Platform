"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { YouTubeThumbnail } from "@/components/youtube-thumbnail"
import { isValidYouTubeUrl } from "@/lib/youtube"
import { useRouter, useParams } from "next/navigation"

export default function NewVideoPage() {
  const params = useParams()
  const materialId = params.id as string
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setYoutubeUrl(url)
    setIsValidUrl(url === "" || isValidYouTubeUrl(url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!isValidYouTubeUrl(youtubeUrl)) {
        throw new Error("Invalid YouTube URL")
      }

      const supabase = createClient()

      const { error } = await supabase.from("videos").insert({
        material_id: materialId,
        title,
        description,
        youtube_url: youtubeUrl,
      })

      if (error) throw error

      router.push(`/instructor/materials/${materialId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Video</h1>
        <p className="text-gray-600 mt-2">Add a YouTube video to your material</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Fill in the video information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Video description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={handleUrlChange}
                    required
                    className={!isValidUrl && youtubeUrl ? "border-red-500" : ""}
                  />
                  {!isValidUrl && youtubeUrl && <p className="text-sm text-red-500">Invalid YouTube URL</p>}
                  {isValidUrl && youtubeUrl && <p className="text-sm text-green-500">Valid YouTube URL</p>}
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading || !isValidUrl}>
                    {isLoading ? "Adding..." : "Add Video"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {isValidUrl && youtubeUrl && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video">
                  <YouTubeThumbnail url={youtubeUrl} title={title} className="w-full h-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
