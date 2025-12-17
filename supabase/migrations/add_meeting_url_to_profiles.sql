-- Migration: Add instructor meeting link fields to profiles
-- Phase 1: Simple instructor-specific meeting links

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS meeting_url TEXT,
ADD COLUMN IF NOT EXISTS meeting_platform TEXT;

-- meeting_url: stores the instructor's personal meeting room URL
-- meeting_platform: auto-detected platform (zoom, meet, teams, other) for future use

-- RLS policies already allow users to UPDATE their own profile row
-- No policy changes needed
