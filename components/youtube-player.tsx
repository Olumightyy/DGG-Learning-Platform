"use client"

import { useState } from "react"
import { extractYouTubeId } from "@/lib/youtube"

interface YouTubePlayerProps {
  url: string
  title?: string
  className?: string
}

export function YouTubePlayer({ url, title, className = "" }: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const videoId = extractYouTubeId(url)

  if (!videoId) {
    return (
      <div className={`bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-white">Invalid YouTube URL</p>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={title || "YouTube video"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
