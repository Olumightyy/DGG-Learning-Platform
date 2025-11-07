"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DeleteResourceButtonProps {
  resourceId: string
  resourceTitle: string
  fileUrl: string
  resourceType: string
}

export function DeleteResourceButton({ 
  resourceId, 
  resourceTitle, 
  fileUrl, 
  resourceType 
}: DeleteResourceButtonProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Delete "${resourceTitle}"?`)) return

    setDeleting(true)

    try {
      // Delete file from storage if it's not an external link
      if (resourceType !== 'link' && fileUrl.includes('supabase')) {
        const urlParts = fileUrl.split('/')
        const bucketIndex = urlParts.indexOf('course-resources')
        if (bucketIndex !== -1) {
          const filePath = urlParts.slice(bucketIndex + 1).join('/')
          await supabase.storage.from('course-resources').remove([filePath])
        }
      }

      // Delete database record
      const { error } = await supabase
        .from('course_resources')
        .delete()
        .eq('id', resourceId)

      if (error) throw error

      // Refresh the page to show updated list
      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete resource')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-600 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}