"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { joinLiveSession } from "@/app/actions/live-sessions"
import { Calendar, Clock, Video } from "lucide-react"
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

interface UpcomingSessionsProps {
  sessions: Session[]
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const [joining, setJoining] = useState<string | null>(null)

  const handleJoin = async (session: Session) => {
    setJoining(session.id)
    try {
      await joinLiveSession(session.id)
      window.open(session.meeting_url, '_blank')
    } catch (err) {
      console.error('Error joining session:', err)
    } finally {
      setJoining(null)
    }
  }

  const getTimeUntilStart = (startTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const diff = start.getTime() - now.getTime()
    
    if (diff < 0) return "Started"
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `in ${days} day${days > 1 ? 's' : ''}`
    }
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    }
    return `in ${minutes}m`
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpcoming = (endTime: string) => new Date(endTime) > new Date()
  const upcomingSessions = sessions.filter(s => isUpcoming(s.scheduled_end))

  if (upcomingSessions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-600" />
          Upcoming Live Sessions
        </CardTitle>
        <CardDescription>Join your scheduled live classes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingSessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 border rounded-lg ${
                session.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{session.title}</h3>
                    {session.is_active && (
                      <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded animate-pulse">
                        🔴 LIVE NOW
                      </span>
                    )}
                    {!session.is_active && (
                      <span className="text-xs text-gray-500">
                        {getTimeUntilStart(session.scheduled_start)}
                      </span>
                    )}
                  </div>
                  
                  {session.material && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {session.material.title}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(session.scheduled_start)}
                    </span>
                  </div>
                  
                  {session.description && (
                    <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                  )}
                </div>
                
                <Button
                  size="sm"
                  className={session.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => handleJoin(session)}
                  disabled={joining === session.id}
                >
                  {joining === session.id ? "Joining..." : "Join Session"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
