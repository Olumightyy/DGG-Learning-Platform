"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

interface ResourceItemProps {
  resource: any // Replace with proper type
}

export function ResourceItem({ resource }: ResourceItemProps) {
  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      pdf: '📄',
      document: '📝',
      video: '🎬',
      image: '🖼️',
      link: '🔗',
      other: '📦'
    }
    return icons[type] || '📄'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-100 text-red-700',
      document: 'bg-blue-100 text-blue-700',
      video: 'bg-purple-100 text-purple-700',
      image: 'bg-green-100 text-green-700',
      link: 'bg-yellow-100 text-yellow-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const handleDelete = async () => {
    if (confirm(`Delete "${resource.title}"?`)) {
      const supabase = createClient()
      
      // Delete file from storage if it's not an external link
      if (resource.resource_type !== 'link' && resource.file_url.includes('supabase')) {
        const urlParts = resource.file_url.split('/')
        const filePath = urlParts.slice(urlParts.indexOf('course-resources') + 1).join('/')
        await supabase.storage.from('course-resources').remove([filePath])
      }
      
      // Delete database record
      await supabase
        .from('course_resources')
        .delete()
        .eq('id', resource.id)
      
      window.location.reload()
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-3xl">
            {getIcon(resource.resource_type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                {resource.title}
              </h4>
              <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${getTypeColor(resource.resource_type)}`}>
                {resource.resource_type.toUpperCase()}
              </span>
            </div>

            {resource.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {resource.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
              {resource.file_size && (
                <span className="flex items-center gap-1">
                  💾 {(resource.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
              {resource.file_name && (
                <span className="truncate max-w-[150px]" title={resource.file_name}>
                  📎 {resource.file_name}
                </span>
              )}
              <span>
                🕐 {new Date(resource.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex gap-2">
              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {resource.resource_type === 'link' ? 'Open Link' : 'View/Download'} →
              </a>
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}