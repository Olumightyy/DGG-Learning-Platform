"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileText, Upload, X } from "lucide-react"

interface AssignmentResourceUploadProps {
  assignmentId?: string // Optional - only when editing existing assignment
  instructorId: string
  currentResourceUrl?: string | null
  currentResourceName?: string | null
  onResourceChange: (url: string | null, name: string | null) => void
}

export function AssignmentResourceUpload({
  assignmentId,
  instructorId,
  currentResourceUrl,
  currentResourceName,
  onResourceChange,
}: AssignmentResourceUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [resourceUrl, setResourceUrl] = useState<string | null>(currentResourceUrl || null)
  const [resourceName, setResourceName] = useState<string | null>(currentResourceName || null)

  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are allowed")
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB")
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Create unique file path
      const timestamp = Date.now()
      const fileExt = file.name.split(".").pop()
      const tempAssignmentId = assignmentId || `temp_${timestamp}`
      const filePath = `${instructorId}/${tempAssignmentId}/${timestamp}_${file.name}`

      setUploadProgress(30)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("assignment-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      setUploadProgress(70)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("assignment-files").getPublicUrl(filePath)

      setUploadProgress(100)

      // Update local state
      setResourceUrl(publicUrl)
      setResourceName(file.name)

      // Notify parent component
      onResourceChange(publicUrl, file.name)

      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const handleRemoveResource = async () => {
    if (!resourceUrl) return

    try {
      // Extract file path from URL
      const urlParts = resourceUrl.split("/assignment-files/")
      if (urlParts.length > 1) {
        const filePath = urlParts[1]

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from("assignment-files")
          .remove([filePath])

        if (deleteError) {
          console.error("Delete error:", deleteError)
          // Continue anyway - file might already be deleted
        }
      }

      // Update local state
      setResourceUrl(null)
      setResourceName(null)

      // Notify parent component
      onResourceChange(null, null)
    } catch (err) {
      console.error("Error removing file:", err)
      setError(err instanceof Error ? err.message : "Failed to remove file")
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="resource-file">Assignment Resource (Optional)</Label>
      <p className="text-xs text-gray-500">
        Upload a PDF, DOC, or DOCX file that students can download (e.g., worksheet, guide)
      </p>

      {!resourceUrl ? (
        <div>
          <label
            htmlFor="resource-file"
            className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Uploading..." : "Click to upload resource"}</span>
            </div>
          </label>
          <input
            id="resource-file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 truncate">{resourceName}</p>
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View file →
              </a>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveResource}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}
