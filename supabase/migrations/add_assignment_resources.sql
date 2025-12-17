-- Migration: Add resource upload fields to assignments table
-- This allows instructors to attach PDF resources to assignments

ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS resource_url TEXT,
ADD COLUMN IF NOT EXISTS resource_name TEXT;

-- No RLS policy changes needed - existing policies already allow
-- instructors to INSERT and UPDATE their own assignments
