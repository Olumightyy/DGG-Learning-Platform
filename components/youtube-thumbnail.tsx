"use client"

import Image from "next/image"
import { getYouTubeThumbnail, extractYouTubeId } from "@/lib/youtube"

interface YouTubeThumbnailProps {
  url: string
  title?: string
  className?: string
}

export function YouTubeThumbnail({ url, title, className = "" }: YouTubeThumbnailProps) {
  const thumbnailUrl = getYouTubeThumbnail(url)
  const videoId = extractYouTubeId(url)

  if (!videoId || !thumbnailUrl) {
    return (
      <div className={`bg-gray-300 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-600">No thumbnail available</p>
      </div>
    )
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden group ${className}`}>
      <Image
        src={thumbnailUrl || "/placeholder.svg"}
        alt={title || "Video thumbnail"}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
