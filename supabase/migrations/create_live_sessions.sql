-- Phase 2: Scheduled Live Sessions System
-- Creates tables for scheduling live classes with time-based sessions

-- Main sessions table
CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_url TEXT NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance tracking (optional but useful)
CREATE TABLE IF NOT EXISTS session_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_sessions_material ON live_sessions(material_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_instructor ON live_sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_start ON live_sessions(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_live_sessions_active ON live_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_session_attendance_session ON session_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_student ON session_attendance(student_id);

-- RLS Policies for live_sessions

-- Enable RLS
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;

-- Instructors can create sessions for their own courses
CREATE POLICY "Instructors can create own sessions"
ON live_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = instructor_id);

-- Instructors can view their own sessions
CREATE POLICY "Instructors can view own sessions"
ON live_sessions FOR SELECT
TO authenticated
USING (auth.uid() = instructor_id);

-- Instructors can update their own sessions
CREATE POLICY "Instructors can update own sessions"
ON live_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = instructor_id);

-- Instructors can delete their own sessions
CREATE POLICY "Instructors can delete own sessions"
ON live_sessions FOR DELETE
TO authenticated
USING (auth.uid() = instructor_id);

-- Students can view sessions for courses they're enrolled in
CREATE POLICY "Students can view enrolled course sessions"
ON live_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.student_id = auth.uid()
    AND enrollments.material_id = live_sessions.material_id
  )
);

-- RLS Policies for session_attendance

-- Students can log their own attendance
CREATE POLICY "Students can log own attendance"
ON session_attendance FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Students can view their own attendance
CREATE POLICY "Students can view own attendance"
ON session_attendance FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

-- Instructors can view attendance for their sessions
CREATE POLICY "Instructors can view session attendance"
ON session_attendance FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM live_sessions
    WHERE live_sessions.id = session_attendance.session_id
    AND live_sessions.instructor_id = auth.uid()
  )
);
