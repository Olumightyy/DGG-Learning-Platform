"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createLiveSession, type LiveSessionData } from "@/app/actions/live-sessions"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Clock, Video, X } from "lucide-react"

interface CreateSessionFormProps {
  onClose?: () => void
  onSuccess?: () => void
}

export function CreateSessionForm({ onClose, onSuccess }: CreateSessionFormProps) {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    material_id: "",
    title: "",
    description: "",
    meeting_url: "",
    scheduled_start: "",
    scheduled_end: ""
  })

  useEffect(() => {
    const fetchMaterials = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return
      
      const { data } = await supabase
        .from("materials")
        .select("id, title")
        .eq("instructor_id", user.id)
        .order("title")
      
      setMaterials(data || [])
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, material_id: data[0].id }))
      }
      setLoading(false)
    }
    
    fetchMaterials()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await createLiveSession(formData as LiveSessionData)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session")
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Courses Found</CardTitle>
          <CardDescription>You need to create a course before scheduling live sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Schedule Live Session
            </CardTitle>
            <CardDescription>Create a new scheduled live class for your students</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material">Course *</Label>
            <select
              id="material"
              value={formData.material_id}
              onChange={(e) => setFormData({ ...formData, material_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to React Hooks"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="What will you cover in this session?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_url">Meeting URL *</Label>
            <Input
              id="meeting_url"
              type="url"
              value={formData.meeting_url}
              onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Start Time *
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.scheduled_start}
                onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                End Time *
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={formData.scheduled_end}
                onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Session"}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
