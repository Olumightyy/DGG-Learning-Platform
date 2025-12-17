"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateProfileMeetingLink } from "@/app/actions/update-profile-meeting-link"
import { Video, Check, AlertCircle, ExternalLink } from "lucide-react"

interface ProfileSettingsProps {
  initialMeetingUrl?: string | null
  initialPlatform?: string | null
}

export function ProfileSettings({ initialMeetingUrl, initialPlatform }: ProfileSettingsProps) {
  const [meetingUrl, setMeetingUrl] = useState(initialMeetingUrl || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await updateProfileMeetingLink(meetingUrl || null)
      setMessage({ type: "success", text: result.message })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update meeting link"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPlatformIcon = () => {
    const platform = initialPlatform || (meetingUrl ? "video" : null)
    return <Video className="h-5 w-5" />
  }

  return (
    <Card className="border-[#512d7c]/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          {getPlatformIcon()}
          <CardTitle className="text-[#512d7c]">Live Class Meeting Link</CardTitle>
        </div>
        <CardDescription>
          Set your personal meeting room link for live classes. Students will see this link on courses you teach.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-url">Meeting Room URL</Label>
            <Input
              id="meeting-url"
              type="url"
              placeholder="https://zoom.us/j/your-meeting-id or https://meet.google.com/your-code"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              💡 <strong>Tip:</strong> Use a permanent meeting room URL so students can always find you
            </p>
            <p className="text-xs text-gray-500">
              ✅ Supported: Zoom, Google Meet, Microsoft Teams, Jitsi, Whereby, Discord
            </p>
          </div>

          {/* Show current link if set */}
          {initialMeetingUrl && (
            <div className="rounded-md bg-blue-50 p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-900 mb-1">Current Link:</p>
              <a
                href={initialMeetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 break-all"
              >
                {initialMeetingUrl}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Success/Error Messages */}
          {message && (
            <div
              className={`rounded-md p-3 flex items-start gap-2 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-800" : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#512d7c] hover:bg-[#3f2361]"
            >
              {isSubmitting ? "Saving..." : "Save Meeting Link"}
            </Button>
            {meetingUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setMeetingUrl("")}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
