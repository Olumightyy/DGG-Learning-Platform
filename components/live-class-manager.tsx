"use client"

import React, { useEffect, useState } from 'react'

export default function LiveClassManager() {
  const [url, setUrl] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/live-class')
      .then((r) => r.json())
      .then((data) => {
        setUrl(data?.meeting_url ?? null)
        setInput(data?.meeting_url ?? '')
      })
  }, [])

  async function save() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_url: input || null }),
      })
      const data = await res.json()
      if (res.ok) {
        setUrl(data.meeting_url ?? null)
        setMessage('Saved')
      } else {
        setMessage(data.error || 'Failed')
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Live Class URL</label>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://meet.example.com/room"
        />
        <button
          className="rounded-md bg-[#512d7c] px-3 py-2 text-white"
          onClick={save}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
      <p className="text-sm text-gray-600">Current: {url ? <a href={url}>{url}</a> : 'No class active'}</p>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </div>
  )
}
