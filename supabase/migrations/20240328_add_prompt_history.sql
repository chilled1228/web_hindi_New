-- Drop existing table if it exists
DROP TABLE IF EXISTS public.prompt_history CASCADE;

-- Create prompt_history table
CREATE TABLE IF NOT EXISTS public.prompt_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  prompt_type TEXT NOT NULL,
  input_image TEXT,
  output_text TEXT NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_date ON public.prompt_history(user_id, created_at);

-- Enable RLS
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own prompt history" ON public.prompt_history;
DROP POLICY IF EXISTS "Users can insert own prompt history" ON public.prompt_history;

-- Create RLS policies for Clerk authentication
CREATE POLICY "Users can view own prompt history"
ON public.prompt_history FOR SELECT
USING (
  auth.jwt() IS NOT NULL 
  AND user_id = (auth.jwt()->>'sub')::text
);

CREATE POLICY "Users can insert own prompt history"
ON public.prompt_history FOR INSERT
WITH CHECK (
  auth.jwt() IS NOT NULL 
  AND user_id = (auth.jwt()->>'sub')::text
);

-- Create function to verify JWT from Clerk
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
  LANGUAGE sql STABLE
  AS $$
    SELECT COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb,
      '{}'::jsonb
    );
  $$; 