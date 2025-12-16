"use client"

import React, { useEffect, useState } from 'react'

export default function JoinLiveButton() {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/live-class')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setUrl(data?.meeting_url ?? null)
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <button className="px-4 py-2 rounded-md bg-gray-200">Loading...</button>

  if (!url) return <button className="px-4 py-2 rounded-md bg-gray-200" disabled>No Class Active</button>

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <button className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">Join Live Class</button>
    </a>
  )
}
