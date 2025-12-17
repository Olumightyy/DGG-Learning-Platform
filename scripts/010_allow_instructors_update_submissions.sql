-- Migration: allow instructors to UPDATE grading fields on submissions
-- This policy permits instructors (owner of the related assignment)
-- to UPDATE rows in public.submissions, but only if they do not modify
-- immutable submission fields (assignment_id, student_id, submission_text, file_url, submitted_at).
-- It is implemented with a conditional DO block to avoid creating duplicate policies.

DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'submissions' AND policyname = 'instructors_update_submissions'
  ) THEN
    CREATE POLICY instructors_update_submissions ON public.submissions
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1
        FROM public.assignments
        WHERE assignments.id = submissions.assignment_id
          AND assignments.instructor_id = auth.uid()
      )
    )
    WITH CHECK (
      -- Instructor must be the assignment owner
      EXISTS (
        SELECT 1
        FROM public.assignments
        WHERE assignments.id = submissions.assignment_id
          AND assignments.instructor_id = auth.uid()
      )
      -- Disallow changing identifying/immutable fields
      AND NEW.assignment_id = OLD.assignment_id
      AND NEW.student_id = OLD.student_id
      AND NEW.submission_text = OLD.submission_text
      AND NEW.file_url = OLD.file_url
      AND NEW.submitted_at = OLD.submitted_at
    );
  END IF;
END
$$;
