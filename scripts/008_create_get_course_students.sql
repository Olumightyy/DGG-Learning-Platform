-- Create RPC function to return students for a course (material)
-- Verifies the caller is the instructor for the material using auth.uid()
CREATE OR REPLACE FUNCTION public.get_course_students(p_material_id UUID)
RETURNS TABLE(
  student_id UUID,
  email TEXT,
  full_name TEXT,
  enrolled_at TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT
    e.student_id,
    COALESCE(p.email, u.email) AS email,
    COALESCE(p.full_name, (u.user_metadata->>'full_name')) AS full_name,
    e.enrolled_at
  FROM public.enrollments e
  JOIN public.materials m ON m.id = p_material_id
  JOIN auth.users u ON u.id = e.student_id
  LEFT JOIN public.profiles p ON p.id = e.student_id
  WHERE e.material_id = p_material_id
    AND m.instructor_id = auth.uid();
$$;

-- Grant execute to authenticated roles if needed
-- GRANT EXECUTE ON FUNCTION public.get_course_students(UUID) TO authenticated;
