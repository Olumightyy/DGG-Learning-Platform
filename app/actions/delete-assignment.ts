"use server"

import { revalidatePath } from 'next/cache'
import { createClient as createServerSupabase } from '@/lib/supabase/server'

export async function deleteAssignment(assignmentId: string) {
  if (!assignmentId) throw new Error('Missing assignmentId')

  const supabase = await createServerSupabase()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check role from profiles
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profileError) throw profileError
  if (!profile || profile.role !== 'instructor') {
    throw new Error('Not authorized')
  }

  const { error } = await supabase.from('assignments').delete().eq('id', assignmentId)
  if (error) throw error

  // Revalidate pages where assignments appear
  try {
    revalidatePath('/instructor/dashboard')
    revalidatePath('/instructor/assignments')
  } catch (err) {
    // ignore revalidation errors
  }

  return { success: true }
}
