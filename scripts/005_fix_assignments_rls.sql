-- Drop the problematic assignments policies
DROP POLICY IF EXISTS "assignments_select_own_or_enrolled" ON public.assignments;
DROP POLICY IF EXISTS "assignments_insert_own" ON public.assignments;
DROP POLICY IF EXISTS "assignments_update_own" ON public.assignments;
DROP POLICY IF EXISTS "assignments_delete_own" ON public.assignments;

-- Recreate assignments RLS policies with simplified logic to avoid infinite recursion
-- Instructors can see their own assignments
CREATE POLICY "assignments_select_own" ON public.assignments FOR SELECT USING (
  auth.uid() = instructor_id
);

-- Students can see assignments they have submissions for
CREATE POLICY "assignments_select_enrolled" ON public.assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.submissions WHERE submissions.assignment_id = assignments.id AND submissions.student_id = auth.uid())
);

-- Only instructors can insert assignments
CREATE POLICY "assignments_insert_own" ON public.assignments FOR INSERT WITH CHECK (
  auth.uid() = instructor_id
);

-- Only instructors can update their own assignments
CREATE POLICY "assignments_update_own" ON public.assignments FOR UPDATE USING (
  auth.uid() = instructor_id
);

-- Only instructors can delete their own assignments
CREATE POLICY "assignments_delete_own" ON public.assignments FOR DELETE USING (
  auth.uid() = instructor_id
);
