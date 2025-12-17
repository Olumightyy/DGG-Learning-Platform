-- Create RLS policy to allow instructors to SELECT submissions for their assignments
-- This policy permits SELECT on public.submissions when the authenticated user
-- is the instructor of the related assignment.

CREATE POLICY "instructors_view_submissions" ON public.submissions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE assignments.id = submissions.assignment_id
      AND assignments.instructor_id = auth.uid()
  )
);

-- Note: If a similar policy already exists, applying this migration will add
-- a second policy. If you prefer idempotent migrations, run a conditional
-- check on your DB before applying.
