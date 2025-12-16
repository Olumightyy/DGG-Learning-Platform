-- Create a simple settings table for app-wide key/value pairs
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default meeting_url key if it doesn't exist
INSERT INTO public.settings (key, value)
SELECT 'meeting_url', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.settings WHERE key = 'meeting_url');

-- Enable RLS on settings (optional) and create policy to allow select for authenticated users
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select_public" ON public.settings FOR SELECT USING (true);
