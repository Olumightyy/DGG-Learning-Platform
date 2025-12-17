# Phase 2 Live Sessions Setup Guide

Follow these steps to activate the new scheduled live sessions system.

## 1. Run Database Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- Located in: supabase/migrations/create_live_sessions.sql
-- Copy and run the entire file contents
```

This will:

- ✅ Create `live_sessions` table
- ✅ Create `session_attendance` table
- ✅ Add RLS policies for security
- ✅ Create indexes for performance

## 2. Verify Tables Created

In Supabase:

1. Go to Table Editor
2. Confirm you see:
   - `live_sessions` table
   - `session_attendance` table

## 3. Test the Feature

### As Instructor:

1. Login to instructor dashboard
2. See "Live Sessions" section with creation form
3. Fill out form to schedule a session
4. Click "Create Session"
5. See session appear in the list

### As Student:

1. Enroll in a course
2. Instructor creates a session for that course
3. Login to student dashboard
4. See "Upcoming Live Sessions" card at top
5. See countdown timer and "Join Session" button

## Done! 🎉

Your scheduled live sessions system is now active.
