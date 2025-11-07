"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResourceUploadProps {
  materialId: string
  onSuccess?: () => void
}

export function ResourceUpload({ materialId, onSuccess }: ResourceUploadProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [resourceType, setResourceType] = useState<string>("pdf")
  const [file, setFile] = useState<File | null>(null)
  const [externalUrl, setExternalUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const supabase = createClient()

  const getResourceType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'document',
      'docx': 'document',
      'ppt': 'document',
      'pptx': 'document',
      'xls': 'document',
      'xlsx': 'document',
      'mp4': 'video',
      'mov': 'video',
      'avi': 'video',
      'mkv': 'video',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'zip': 'other',
      'rar': 'other',
    }
    return typeMap[ext || ''] || 'other'
  }

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setError(null)
    setProgress(0)

    // basic validation: ensure either a real external URL or a file
    if (!file && (!externalUrl || externalUrl === "https://")) {
      setError("Please provide a file or a valid external URL.")
      setUploading(false)
      return
    }

    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const user = userData?.user
      if (!user) throw new Error("Not authenticated")

      let finalFileUrl = externalUrl
      let fileName = ""
      let fileSize = 0
      let detectedType = resourceType

      // Upload file if provided
      if (file) {
        setProgress(20)
        
        const timestamp = Date.now()
        fileName = file.name
        fileSize = file.size
        detectedType = getResourceType(file.name)
        const filePath = `${user.id}/${materialId}/${timestamp}_${fileName}`

        setProgress(40)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("course-resources")
          .upload(filePath, file)

        if (uploadError) throw uploadError
        if (!uploadData) throw new Error("Upload failed: no response")

        setProgress(60)

        const { data: publicData } = await supabase.storage
          .from("course-resources")
          .getPublicUrl(filePath)
        // getPublicUrl may return data.publicUrl
        const publicUrl = (publicData as any)?.publicUrl || ""
        if (!publicUrl) {
          // fall back to a path-based URL if necessary or throw
          throw new Error("Failed to get public URL for uploaded file")
        }

        finalFileUrl = publicUrl
      }

      setProgress(80)

      // Insert resource record
      const { error: dbError } = await supabase
        .from("course_resources")
        .insert({
          material_id: materialId,
          title: title || fileName || "Untitled Resource",
          description,
          resource_type: detectedType,
          file_url: finalFileUrl,
          file_size: fileSize,
          file_name: fileName,
        })

      if (dbError) throw dbError

      setProgress(100)

      // Reset form
      setTitle("")
      setDescription("")
      setFile(null)
      setExternalUrl("")
      if (fileInputRef.current) fileInputRef.current.value = ""

      // lightweight success feedback
      alert("Resource uploaded successfully!")
      onSuccess?.()
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Resource</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Course Notes - Week 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe this resource..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Method
            </label>
            <div className="space-y-3">
              {/* File Upload Option */}
              <div className="border rounded-md p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMethod"
                    checked={!externalUrl}
                    onChange={() => {
                      // switch to file upload: clear external URL and keep file input as-is
                      setExternalUrl("")
                    }}
                  />
                  <span className="font-medium">Upload File</span>
                </label>
                {!externalUrl && (
                  <div className="mt-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.jpg,.jpeg,.png,.zip,.rar"
                    />
                    {file && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Supported: PDF, Word, PowerPoint, Excel, Videos, Images, ZIP/RAR (Max 50MB)
                    </p>
                  </div>
                )}
              </div>

              {/* External Link Option */}
              <div className="border rounded-md p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMethod"
                    checked={!!externalUrl}
                    onChange={() => {
                      setExternalUrl("https://")
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  />
                  <span className="font-medium">External Link (Google Drive, Dropbox, etc.)</span>
                </label>
                {externalUrl !== "" && (
                  <div className="mt-3">
                    <input
                      type="url"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://drive.google.com/file/..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Paste a shareable link from Google Drive, Dropbox, OneDrive, etc.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {progress > 0 && progress < 100 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading || (!file && (!externalUrl || externalUrl === "https://")) || !title}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Add Resource"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}