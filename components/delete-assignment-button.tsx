"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter()

  async function handleDelete() {
    const ok = confirm('Delete this assignment? This will remove all submissions.')
    if (!ok) return

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/delete`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        // refresh server components
        router.refresh()
      } else {
        alert(data.error || 'Failed to delete')
      }
    } catch (err: any) {
      alert(err?.message || 'Error')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      title="Delete assignment"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
      </svg>
    </button>
  )
}
