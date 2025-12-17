"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { startLiveSession, endLiveSession, deleteLiveSession } from "@/app/actions/live-sessions"
import { Play, Square, Trash2, Users, Calendar, Clock } from "lucide-react"
import { useState } from "react"

interface Session {
  id: string
  title: string
  description: string | null
  meeting_url: string
  scheduled_start: string
  scheduled_end: string
  is_active: boolean
  material?: {
    title: string
  }
}

interface SessionListProps {
  sessions: Session[]
  onUpdate?: () => void
}

export function SessionList({ sessions, onUpdate }: SessionListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleStart = async (sessionId: string) => {
    setLoading(sessionId)
    try {
      await startLiveSession(sessionId)
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start session")
    } finally {
      setLoading(null)
    }
  }

  const handleEnd = async (sessionId: string) => {
    setLoading(sessionId)
    try {
      await endLiveSession(sessionId)
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to end session")
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return
    
    setLoading(sessionId)
    try {
      await deleteLiveSession(sessionId)
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete session")
    } finally {
      setLoading(null)
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpcoming = (startTime: string) => new Date(startTime) > new Date()
  const isPast = (endTime: string) => new Date(endTime) < new Date()

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <div className="text-gray-400 text-4xl mb-2">📅</div>
          <p className="text-gray-600">No live sessions scheduled yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className={session.is_active ? "border-green-500 border-2" : ""}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  {session.is_active && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded animate-pulse">
                      🔴 LIVE
                    </span>
                  )}
                  {isPast(session.scheduled_end) && !session.is_active && (
                    <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded">
                      Ended
                    </span>
                  )}
                </div>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(session.scheduled_start)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(session.scheduled_end)}
                  </span>
                </CardDescription>
                {session.material && (
                  <p className="text-xs text-gray-500 mt-1">
                    Course: {session.material.title}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {session.description && (
              <p className="text-sm text-gray-600 mb-3">{session.description}</p>
            )}
            
            <div className="flex items-center gap-2">
              {session.is_active ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleEnd(session.id)}
                  disabled={loading === session.id}
                >
                  <Square className="h-4 w-4 mr-1" />
                  End Session
                </Button>
              ) : isUpcoming(session.scheduled_start) && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStart(session.id)}
                  disabled={loading === session.id}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Session
                </Button>
              )}
              
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <Users className="h-4 w-4" />
                Open Meeting
              </a>

              {!session.is_active && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                  onClick={() => handleDelete(session.id)}
                  disabled={loading === session.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
