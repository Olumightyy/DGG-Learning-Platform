"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface LiveSessionData {
  material_id: string
  title: string
  description?: string
  meeting_url: string
  scheduled_start: string // ISO timestamp
  scheduled_end: string // ISO timestamp
}

/**
 * Create a new live session
 */
export async function createLiveSession(data: LiveSessionData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Validate meeting URL
  try {
    new URL(data.meeting_url)
  } catch {
    throw new Error('Invalid meeting URL')
  }

  // Validate times
  const start = new Date(data.scheduled_start)
  const end = new Date(data.scheduled_end)
  
  if (start >= end) {
    throw new Error('End time must be after start time')
  }

  if (start < new Date()) {
    throw new Error('Start time must be in the future')
  }

  const { data: session, error } = await supabase
    .from('live_sessions')
    .insert({
      ...data,
      instructor_id: user.id,
      is_active: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    throw new Error('Failed to create session')
  }

  revalidatePath('/instructor/dashboard')
  revalidatePath('/student/dashboard')
  
  return session
}

/**
 * Update an existing session
 */
export async function updateLiveSession(sessionId: string, data: Partial<LiveSessionData>) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Validate meeting URL if provided
  if (data.meeting_url) {
    try {
      new URL(data.meeting_url)
    } catch {
      throw new Error('Invalid meeting URL')
    }
  }

  // Validate times if both provided
  if (data.scheduled_start && data.scheduled_end) {
    const start = new Date(data.scheduled_start)
    const end = new Date(data.scheduled_end)
    
    if (start >= end) {
      throw new Error('End time must be after start time')
    }
  }

  const { error } = await supabase
    .from('live_sessions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('instructor_id', user.id)

  if (error) {
    console.error('Error updating session:', error)
    throw new Error('Failed to update session')
  }

  revalidatePath('/instructor/dashboard')
  revalidatePath('/student/dashboard')
}

/**
 * Delete a session
 */
export async function deleteLiveSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('live_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('instructor_id', user.id)

  if (error) {
    console.error('Error deleting session:', error)
    throw new Error('Failed to delete session')
  }

  revalidatePath('/instructor/dashboard')
  revalidatePath('/student/dashboard')
}

/**
 * Start a session (mark as active)
 */
export async function startLiveSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('live_sessions')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('instructor_id', user.id)

  if (error) {
    console.error('Error starting session:', error)
    throw new Error('Failed to start session')
  }

  revalidatePath('/instructor/dashboard')
  revalidatePath('/student/dashboard')
}

/**
 * End a session (mark as inactive)
 */
export async function endLiveSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('live_sessions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('instructor_id', user.id)

  if (error) {
    console.error('Error ending session:', error)
    throw new Error('Failed to end session')
  }

  revalidatePath('/instructor/dashboard')
  revalidatePath('/student/dashboard')
}

/**
 * Join a session (log attendance)
 */
export async function joinLiveSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Log attendance (ignore if already joined - UNIQUE constraint)
  const { error } = await supabase
    .from('session_attendance')
    .insert({
      session_id: sessionId,
      student_id: user.id
    })

  // Ignore duplicate key error (already joined)
  if (error && !error.message.includes('duplicate')) {
    console.error('Error logging attendance:', error)
  }
}
