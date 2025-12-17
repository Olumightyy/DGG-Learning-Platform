"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Validates if a URL is a valid meeting link format
 */
function isValidMeetingUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    
    // Must be HTTPS for security
    if (urlObj.protocol !== 'https:') {
      return false
    }
    
    // Known meeting platforms
    const validDomains = [
      'zoom.us',
      'meet.google.com',
      'teams.microsoft.com',
      'meet.jit.si',
      'whereby.com',
      'discord.com',
      'discord.gg',
    ]
    
    // Check if domain matches any known platform or is a reasonable domain
    const hostname = urlObj.hostname.toLowerCase()
    const isKnownPlatform = validDomains.some(domain => hostname.includes(domain))
    const hasValidDomain = hostname.includes('.') && hostname.length > 3
    
    return isKnownPlatform || hasValidDomain
  } catch {
    return false
  }
}

/**
 * Auto-detects the meeting platform from URL
 */
function detectPlatform(url: string): string {
  const urlLower = url.toLowerCase()
  
  if (urlLower.includes('zoom.us')) return 'zoom'
  if (urlLower.includes('meet.google.com')) return 'meet'
  if (urlLower.includes('teams.microsoft.com')) return 'teams'
  if (urlLower.includes('meet.jit.si')) return 'jitsi'
  if (urlLower.includes('whereby.com')) return 'whereby'
  if (urlLower.includes('discord')) return 'discord'
  
  return 'other'
}

/**
 * Updates the instructor's meeting link in their profile
 * @param url - Meeting room URL (null to remove)
 * @returns Success message or throws error
 */
export async function updateProfileMeetingLink(url: string | null): Promise<{ success: boolean, message: string }> {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Not authenticated')
  }
  
  // Validate URL if provided
  if (url) {
    const trimmedUrl = url.trim()
    
    if (!trimmedUrl) {
      url = null // Treat empty string as removal
    } else {
      if (!isValidMeetingUrl(trimmedUrl)) {
        throw new Error('Invalid meeting URL. Please use a valid HTTPS link from Zoom, Google Meet, Teams, or similar platforms.')
      }
      
      // Sanitize URL by reconstructing it
      try {
        const urlObj = new URL(trimmedUrl)
        url = urlObj.href
      } catch {
        throw new Error('Invalid URL format')
      }
    }
  }
  
  // Detect platform
  const platform = url ? detectPlatform(url) : null
  
  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      meeting_url: url,
      meeting_platform: platform
    })
    .eq('id', user.id)
  
  if (updateError) {
    console.error('Error updating meeting link:', updateError)
    throw new Error('Failed to update meeting link')
  }
  
  // Revalidate relevant pages
  revalidatePath('/instructor/dashboard')
  revalidatePath('/student/dashboard')
  
  return {
    success: true,
    message: url ? 'Meeting link saved successfully' : 'Meeting link removed successfully'
  }
}
