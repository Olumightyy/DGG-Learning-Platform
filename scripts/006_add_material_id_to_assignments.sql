-- Add material_id column to assignments table
ALTER TABLE public.assignments ADD COLUMN material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE;

-- Create an index for better performance
CREATE INDEX idx_assignments_material_id ON public.assignments(material_id);

-- Make material_id NOT NULL (required for all assignments)
ALTER TABLE public.assignments ALTER COLUMN material_id SET NOT NULL;
