"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateGrade(
  submissionId: string, 
  score: number, 
  feedback?: string | null,
  assignmentId?: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('submissions')
    .update({ 
      score, 
      feedback: feedback || null,
      graded_at: new Date().toISOString() 
    })
    .eq('id', submissionId)

  if (error) throw error

  if (assignmentId) {
    try {
      revalidatePath(`/instructor/assignments/${assignmentId}`)
      revalidatePath('/instructor/dashboard')
    } catch (err) {
      // ignore revalidate errors in dev
    }
  }

  return
}

export async function updateGradeFromForm(formData: FormData): Promise<void> {
  const submissionId = formData.get('submission_id') as string
  const scoreRaw = formData.get('score') as string
  const assignmentId = formData.get('assignment_id') as string | null
  const score = scoreRaw !== null && scoreRaw !== '' ? Number(scoreRaw) : null

  if (!submissionId) throw new Error('Missing submission id')

  await updateGrade(submissionId, score as number, assignmentId || undefined)
}
