-- Add is_public column to materials table to allow instructors to publish courses
ALTER TABLE public.materials ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Update RLS policy to allow students to view public materials
DROP POLICY IF EXISTS "materials_select_own_or_enrolled" ON public.materials;

CREATE POLICY "materials_select_own_or_enrolled_or_public" ON public.materials FOR SELECT USING (
  auth.uid() = instructor_id OR 
  EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.material_id = materials.id AND enrollments.student_id = auth.uid()) OR
  is_public = true
);

-- Update videos RLS policy to allow viewing videos in public materials
DROP POLICY IF EXISTS "videos_select_own_or_enrolled" ON public.videos;

CREATE POLICY "videos_select_own_or_enrolled_or_public" ON public.videos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.materials 
    WHERE materials.id = videos.material_id 
    AND (
      auth.uid() = materials.instructor_id OR 
      EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.material_id = materials.id AND enrollments.student_id = auth.uid()) OR
      materials.is_public = true
    )
  )
);
