-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create materials table (course materials/lessons)
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT,
  submission_text TEXT,
  score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assignment_id, student_id)
);

-- Create enrollments table (students enrolled in courses)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, material_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Materials RLS policies (instructors can manage their own, students can view enrolled)
CREATE POLICY "materials_select_own_or_enrolled" ON public.materials FOR SELECT USING (
  auth.uid() = instructor_id OR 
  EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.material_id = materials.id AND enrollments.student_id = auth.uid())
);
CREATE POLICY "materials_insert_own" ON public.materials FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "materials_update_own" ON public.materials FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "materials_delete_own" ON public.materials FOR DELETE USING (auth.uid() = instructor_id);

-- Videos RLS policies (inherit from materials)
CREATE POLICY "videos_select_own_or_enrolled" ON public.videos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.materials 
    WHERE materials.id = videos.material_id 
    AND (
      auth.uid() = materials.instructor_id OR 
      EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.material_id = materials.id AND enrollments.student_id = auth.uid())
    )
  )
);
CREATE POLICY "videos_insert_own" ON public.videos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.materials WHERE materials.id = videos.material_id AND auth.uid() = materials.instructor_id)
);
CREATE POLICY "videos_update_own" ON public.videos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.materials WHERE materials.id = videos.material_id AND auth.uid() = materials.instructor_id)
);
CREATE POLICY "videos_delete_own" ON public.videos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.materials WHERE materials.id = videos.material_id AND auth.uid() = materials.instructor_id)
);

-- Assignments RLS policies
CREATE POLICY "assignments_select_own_or_enrolled" ON public.assignments FOR SELECT USING (
  auth.uid() = instructor_id OR 
  EXISTS (SELECT 1 FROM public.submissions WHERE submissions.assignment_id = assignments.id AND submissions.student_id = auth.uid())
);
CREATE POLICY "assignments_insert_own" ON public.assignments FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "assignments_update_own" ON public.assignments FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "assignments_delete_own" ON public.assignments FOR DELETE USING (auth.uid() = instructor_id);

-- Submissions RLS policies
CREATE POLICY "submissions_select_own_or_instructor" ON public.submissions FOR SELECT USING (
  auth.uid() = student_id OR 
  EXISTS (SELECT 1 FROM public.assignments WHERE assignments.id = submissions.assignment_id AND assignments.instructor_id = auth.uid())
);
CREATE POLICY "submissions_insert_own" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "submissions_update_own" ON public.submissions FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "submissions_delete_own" ON public.submissions FOR DELETE USING (auth.uid() = student_id);

-- Enrollments RLS policies
CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "enrollments_insert_own" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "enrollments_delete_own" ON public.enrollments FOR DELETE USING (auth.uid() = student_id);
